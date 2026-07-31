import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { basename } from 'node:path';
import { type ArgumentConfig, parse } from 'ts-command-line-args';
import { isEqual, isPlainObject } from 'lodash-es';
import { saveString } from './common/files.ts';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';

/** Marker so CI can find and update its own comment rather than posting a new one */
const commentMarker = '<!-- vault-config-diff -->';
const vaultConfigDir = 'src/config/vault';
/** GitHub hard-limits comments to 65536 characters */
const defaultMaxChars = 60000;
/** Longest a single before/after value is rendered before being cut */
const maxValueChars = 160;
/** Range of unix seconds we are willing to pretty print as a date: 2001-09-09 to 2100-01-01 */
const minTimestamp = 1_000_000_000;
const maxTimestamp = 4_102_444_800;
/** How deep flattenFields will recurse before recording a value whole */
const maxFlattenDepth = 64;
/** Caps on the prelude, so it can never evict the summary it is introducing */
const maxListedChains = 20;
const maxListedProblems = 10;

type RunArgs = {
  help?: boolean;
  base: string;
  head?: string;
  output?: string;
  maxChars: number;
};

const runArgsConfig: ArgumentConfig<RunArgs> = {
  help: {
    type: Boolean,
    alias: 'h',
    description: 'Display this usage guide.',
    optional: true,
  },
  base: {
    type: String,
    alias: 'b',
    description: 'Git ref/sha to compare against',
    defaultValue: 'origin/main',
  },
  head: {
    type: String,
    alias: 'a',
    description: 'Git ref/sha to compare with (defaults to the working tree)',
    optional: true,
  },
  output: {
    type: String,
    alias: 'o',
    description: 'File to write the markdown to (defaults to stdout)',
    optional: true,
  },
  maxChars: {
    type: Number,
    alias: 'm',
    description: `Truncate the output to this many characters (default ${defaultMaxChars})`,
    defaultValue: defaultMaxChars,
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'npm run vaultConfigDiff',
        content: `Summarize the changes made to ${vaultConfigDir}/*.json between two git refs as markdown`,
      },
    ],
  });
}

type VaultLocation = {
  /** chain id, taken from the json filename */
  chain: string;
  vault: VaultConfig;
};

type FieldChange = {
  path: string;
  before: unknown;
  after: unknown;
};

type ModifiedVault = VaultLocation & {
  before: VaultConfig;
  changes: FieldChange[];
};

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf-8', maxBuffer: 256 * 1024 * 1024 });
}

function chainIdFromPath(path: string): string {
  return basename(path, '.json');
}

type ChainFiles = {
  paths: string[];
  /** entries under the directory that are not ordinary files, reported rather than ignored */
  skipped: string[];
};

/**
 * Chain config files present at a given ref.
 *
 * Deliberately not recursive: the app loader, validatePools and listChainFilesOnDisk all read only
 * the direct children of this directory, so a recursive listing here would let a nested file like
 * `src/config/vault/zz/base.json` claim the `base` chain and mask the real one.
 *
 * `-z` gives verbatim paths, but only without `--format`, which C-quotes them regardless.
 */
function listChainFilesAtRef(ref: string): ChainFiles {
  const output = git(['ls-tree', '-z', ref, '--', `${vaultConfigDir}/`]);
  const paths: string[] = [];
  const skipped: string[] = [];

  for (const entry of output.split('\0')) {
    const match = /^(\d{6}) (\w+) [0-9a-f]+\t(.*)$/s.exec(entry);
    if (!match) {
      continue;
    }
    const [, mode, type, path] = match;
    if (!path.endsWith('.json')) {
      continue;
    }
    if (!/^[a-z0-9_-]+\.json$/i.test(basename(path))) {
      // an unexpected name would otherwise become a chain id and be rendered as one
      skipped.push(`${path} is not a recognisable chain file name`);
    } else if (type === 'blob' && (mode === '100644' || mode === '100755')) {
      paths.push(path);
    } else {
      // a symlink or submodule would otherwise vanish from both sides without a word
      skipped.push(`${path} is not a regular file (mode ${mode})`);
    }
  }

  return { paths, skipped };
}

/** Chain config files present in the working tree */
async function listChainFilesOnDisk(): Promise<string[]> {
  const files = await readdir(vaultConfigDir);
  return files.filter(file => file.endsWith('.json')).map(file => `${vaultConfigDir}/${file}`);
}

function parseVaults(path: string, contents: string): VaultConfig[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (e) {
    throw new Error(`${path} is not valid JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`${path} does not contain an array`);
  }
  return parsed as VaultConfig[];
}

function loadVaultsAtRef(ref: string, path: string): VaultConfig[] {
  return parseVaults(`${ref}:${path}`, git(['show', `${ref}:${path}`]));
}

async function loadVaultsOnDisk(path: string): Promise<VaultConfig[]> {
  return parseVaults(path, await readFile(path, 'utf-8'));
}

/**
 * Vaults keyed by `chain:id`; a vault moving between chain files is rare enough
 * that reporting it as a removal + addition is preferable to the extra complexity.
 */
type VaultsByKey = Map<string, VaultLocation>;

function indexVaults(
  chain: string,
  vaults: VaultConfig[],
  into: VaultsByKey,
  notes: string[]
): void {
  for (const [index, vault] of vaults.entries()) {
    if (!vault || typeof vault.id !== 'string') {
      notes.push(`${chain} entry ${index} has no string id and was not compared`);
      continue;
    }
    const key = `${chain}:${vault.id}`;
    if (into.has(key)) {
      // keep the first and say so; dropping the chain would hide every other change in it
      notes.push(`${chain} has more than one vault with id ${vault.id}`);
      continue;
    }
    into.set(key, { chain, vault });
  }
}

type SideLoad = {
  vaults: VaultsByKey;
  /** chains that could not be parsed at all, so they cannot be compared either way */
  broken: Map<string, string>;
  /** entries that were skipped, which still leaves the rest of the chain comparable */
  notes: string[];
};

/** Anything here means the config is malformed, not that the tool failed */
function sideProblems(side: SideLoad): string[] {
  return [
    ...[...side.broken].map(([chain, why]) => `${chain} could not be read: ${why}`),
    ...side.notes,
  ];
}

/** How many chain files differ textually between two refs */
function countChangedChainFiles(base: string, head: string | undefined): number {
  if (head === undefined) {
    return 0;
  }
  return git(['diff', '--name-only', '-z', base, head, '--', `${vaultConfigDir}/`])
    .split('\0')
    .filter(Boolean).length;
}

/** Only an omitted ref means the working tree; an empty one is a caller bug, not a default */
async function loadSide(ref: string | undefined): Promise<SideLoad> {
  const fromDisk = ref === undefined;
  const listed =
    fromDisk ?
      { paths: await listChainFilesOnDisk(), skipped: [] as string[] }
    : listChainFilesAtRef(ref);
  const vaults: VaultsByKey = new Map();
  const broken = new Map<string, string>();
  const notes: string[] = [...listed.skipped];

  for (const path of listed.paths) {
    const chain = chainIdFromPath(path);
    try {
      const loaded = fromDisk ? await loadVaultsOnDisk(path) : loadVaultsAtRef(ref, path);
      indexVaults(chain, loaded, vaults, notes);
    } catch (e) {
      // one unparseable chain file should not hide every other chain's changes
      broken.set(chain, e instanceof Error ? e.message : String(e));
    }
  }

  return { vaults, broken, notes };
}

/**
 * Keys come from the config json, so a key containing a dot would otherwise produce a path that
 * collides with a real nested one and hide the change. Escaped the same way as a json pointer.
 */
function escapePathSegment(key: string): string {
  // '' would otherwise produce the parent's own path again and overwrite its leaves
  return key === '' ? '~2' : key.replace(/~/g, '~0').replace(/\./g, '~1');
}

/**
 * Walks both sides together. Descending only where both sides are objects means a field that exists
 * on one side only is reported as a single row holding the whole value, instead of one row per leaf
 * inside it: adding `risks` gives `risks | _unset_ | {...}`, not eight identical-looking rows.
 */
function collectChanges(
  before: unknown,
  after: unknown,
  path: string,
  into: FieldChange[],
  depth = 0
): void {
  if (isEqual(before, after)) {
    return;
  }

  if (isPlainObject(before) && isPlainObject(after) && depth < maxFlattenDepth) {
    const previous = before as Record<string, unknown>;
    const current = after as Record<string, unknown>;
    // `after` first so rows come out in config field order, then anything only in `before`
    for (const key of new Set([...Object.keys(current), ...Object.keys(previous)])) {
      const segment = escapePathSegment(key);
      collectChanges(
        previous[key],
        current[key],
        path ? `${path}.${segment}` : segment,
        into,
        depth + 1
      );
    }
    return;
  }

  into.push({ path, before, after });
}

function diffVault(before: VaultConfig, after: VaultConfig): FieldChange[] {
  const changes: FieldChange[] = [];
  collectChanges(before, after, '', changes);
  return changes;
}

function truncateValue(value: string, start = 0): string {
  const head = start > 0 ? '…' : '';
  const tail = start + maxValueChars < value.length ? '…' : '';
  return `${head}${value.slice(start, start + maxValueChars)}${tail}`;
}

/**
 * Characters that render as nothing, or silently reorder what follows them, in a GitHub comment.
 * Every rendered value comes from the config json, so strip them rather than let a value disguise
 * what it actually says. Line endings are handled separately by cell() and inlineHtml().
 */
function stripUnsafe(value: string): string {
  // escaped rather than deleted: removing them would make two values that really do differ render
  // as identical cells, and a bare U+FFFD for all of them would do the same
  return value.replace(
    // eslint-disable-next-line no-control-regex -- matching them is the whole point
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2028\u2029\u2060-\u2064\u2066-\u206F\uFEFF]/g,
    character => `<U+${character.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}>`
  );
}

/** Renders a value as a markdown code span.*/
function code(value: string, start = 0): string {
  const text = stripUnsafe(truncateValue(value, start)).replace(/\r\n?|\n/g, ' ');
  const longestRun = Math.max(0, ...[...text.matchAll(/`+/g)].map(match => match[0].length));
  const fence = '`'.repeat(longestRun + 1);
  // a code span loses one leading and one trailing space, so pad when that would hide a difference
  const pad = /^[ `]|[ `]$/.test(text) ? ' ' : '';
  return `${fence}${pad}${text}${pad}${fence}`;
}

/**
 * Values interpolated into the raw html of the details block, where a code span would not help.
 * A line ending has to go first: it would close the html block, and everything after it would then
 * be parsed as markdown written by the bot.
 */
function inlineHtml(value: string): string {
  return stripUnsafe(value.replace(/\r\n?|\n/g, ' '))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** The text code() would render, so both sides of a change can be windowed consistently */
function valueText(value: unknown): string {
  if (value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value) ?? typeof value;
}

/**
 * Each side of a change is cut to maxValueChars on its own, so two long values that differ only
 * past the cut would render as identical cells. Window both around the first difference instead.
 */
function divergenceStart(before: unknown, after: unknown): number {
  const a = valueText(before);
  const b = valueText(after);
  if (a.length <= maxValueChars && b.length <= maxValueChars) {
    return 0;
  }
  if (a.slice(0, maxValueChars) !== b.slice(0, maxValueChars)) {
    return 0;
  }
  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index]) {
    index++;
  }
  return Math.max(0, index - Math.floor(maxValueChars / 2));
}

/** `createdAt`, `retiredAt`, `pausedAt`, `risks.updatedAt` etc. hold unix seconds */
function isTimestampPath(path: string): boolean {
  return /(?:^|\.)[a-zA-Z]*At$/.test(path);
}

/**
 * Renders a unix seconds value as a readable date, or undefined if it does not look like one.
 * Always UTC: GitHub strips `relative-time` from comment bodies and does not localize `time`,
 * so the reader's timezone is not available to us.
 */
function renderTimestamp(value: number): string | undefined {
  if (!Number.isInteger(value) || value < minTimestamp || value > maxTimestamp) {
    return undefined;
  }
  return new Date(value * 1000).toISOString().replace('T', ' ').replace('.000Z', ' UTC');
}

function renderValue(value: unknown, path: string, start = 0, showType = false): string {
  if (value === undefined) {
    return '_unset_';
  }

  const suffix = showType ? ` _(${value === null ? 'null' : typeof value})_` : '';

  if (typeof value === 'string') {
    if (value.length === 0) {
      return `_empty string_${suffix}`;
    }
    // json quoted when the type is in question, so "0" cannot look like the number 0, and whenever
    // the string has edge whitespace, which a code span would otherwise swallow
    return showType || value !== value.trim() ?
        `${code(JSON.stringify(value), start)}${suffix}`
      : code(value, start);
  }
  if (typeof value === 'number' && isTimestampPath(path)) {
    const timestamp = renderTimestamp(value);
    if (timestamp) {
      return `${code(timestamp)} (${value})${suffix}`;
    }
  }
  // null, numbers, booleans, arrays and any object left un-flattened
  return `${code(JSON.stringify(value) ?? typeof value, start)}${suffix}`;
}

/**
 * Make a rendered value safe to put inside a markdown table cell. A lone carriage return counts as
 * a line ending to GitHub's renderer, so matching only \r?\n would let a value end the row early.
 */
function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r\n?|\n/g, '<br>');
}

function vaultType(vault: VaultConfig): string {
  // type is optional in older configs, where it means standard; the json itself is untrusted
  return typeof vault.type === 'string' && vault.type ? vault.type : 'standard';
}

function renderModifiedVault({ chain, vault, changes }: ModifiedVault): string {
  const fields = changes.map(change => change.path).join(', ');
  return [
    '<details>',
    // raw html, so every interpolated value has to be html escaped rather than wrapped in a code span
    `<summary><code>${inlineHtml(vault.id)}</code> (<code>${inlineHtml(chain)}</code>) — ${inlineHtml(truncateValue(fields))}</summary>`,
    '',
    '| Field | Before | After |',
    '| --- | --- | --- |',
    ...changes.map(change => {
      const start = divergenceStart(change.before, change.after);
      // otherwise 0 and "0", or true and "true", render as two identical looking cells
      const showType =
        change.before !== undefined &&
        change.after !== undefined &&
        (typeof change.before !== typeof change.after ||
          (change.before === null) !== (change.after === null));
      return `| ${cell(code(change.path))} | ${cell(renderValue(change.before, change.path, start, showType))} | ${cell(renderValue(change.after, change.path, start, showType))} |`;
    }),
    '',
    '</details>',
    '',
  ].join('\n');
}

function byChainThenId(a: VaultLocation, b: VaultLocation): number {
  return a.chain.localeCompare(b.chain) || a.vault.id.localeCompare(b.vault.id);
}

type Diff = {
  added: VaultLocation[];
  removed: VaultLocation[];
  modified: ModifiedVault[];
  /** chain -> why it could not be compared */
  broken: Map<string, string>;
  /** entries skipped on either side, which the reader still needs to know about */
  notes: string[];
  /** chain files that differ textually, so a reorder-only change is not reported as nothing */
  filesTouched: number;
};

function buildDiff(base: SideLoad, head: SideLoad, filesTouched: number): Diff {
  // a chain that failed to load on either side would otherwise look like a mass add or delete
  const broken = new Map([...base.broken, ...head.broken]);
  const notes = [...new Set([...base.notes, ...head.notes])];

  const usable = (entry: VaultLocation) => !broken.has(entry.chain);

  const added: VaultLocation[] = [];
  const removed: VaultLocation[] = [];
  const modified: ModifiedVault[] = [];

  for (const [key, current] of head.vaults) {
    if (!usable(current)) {
      continue;
    }
    const previous = base.vaults.get(key);
    if (!previous) {
      added.push(current);
      continue;
    }
    try {
      const changes = diffVault(previous.vault, current.vault);
      if (changes.length > 0) {
        modified.push({ ...current, before: previous.vault, changes });
      }
    } catch (e) {
      notes.push(
        `${current.chain} ${current.vault.id} could not be compared: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  for (const [key, previous] of base.vaults) {
    if (usable(previous) && !head.vaults.has(key)) {
      removed.push(previous);
    }
  }

  added.sort(byChainThenId);
  removed.sort(byChainThenId);
  modified.sort(byChainThenId);

  return { added, removed, modified, broken, notes, filesTouched };
}

/** Renders one id/chain/type table, stopping before it exceeds its share of the comment */
function renderTableSection(title: string, vaults: VaultLocation[], budget: number): string {
  const lines = [
    `### ${title} (${vaults.length})`,
    '',
    '| Vault ID | Chain | Type |',
    '| --- | --- | --- |',
  ];
  let used = lines.join('\n').length;

  for (const [index, { chain, vault }] of vaults.entries()) {
    const row = `| ${cell(code(vault.id))} | ${cell(code(chain))} | ${cell(code(vaultType(vault)))} |`;
    const footer = `\n_… and ${vaults.length - index} more not shown._`;
    if (used + row.length + footer.length + 2 > budget) {
      lines.push(footer.trimStart());
      break;
    }
    lines.push(row);
    used += row.length + 1;
  }

  lines.push('');
  return lines.join('\n');
}

function renderDiff(
  { added, removed, modified, broken, notes, filesTouched }: Diff,
  maxChars: number
): string {
  const parts = [commentMarker, '## Vault config changes', ''];
  const problems = [
    ...[...broken].map(([chain, why]) => `${chain} could not be read: ${why}`),
    ...notes,
  ];
  const changed = added.length > 0 || removed.length > 0 || modified.length > 0;

  if (!changed && problems.length === 0) {
    parts.push(
      filesTouched > 0 ?
        `No vault config changes detected (${filesTouched} file(s) changed, ordering or formatting only).`
      : 'No vault config changes detected.',
      ''
    );
    return parts.join('\n');
  }

  if (changed) {
    const chains = [...new Set([...added, ...removed, ...modified].map(({ chain }) => chain))]
      .sort()
      .map(chain => code(chain));
    const shownChains = chains.slice(0, maxListedChains).join(', ');
    const moreChains =
      chains.length > maxListedChains ? ` and ${chains.length - maxListedChains} more` : '';
    const counts = [
      added.length > 0 && `**${added.length}** added`,
      removed.length > 0 && `**${removed.length}** removed`,
      modified.length > 0 && `**${modified.length}** modified`,
    ].filter((part): part is string => !!part);
    parts.push(`${counts.join(' · ')} across ${shownChains}${moreChains}`, '');
  } else {
    // never an all-clear when something could not be read; that is the dangerous wrong answer
    parts.push('No comparable vault config changes, but some entries could not be read.', '');
  }

  if (problems.length > 0) {
    // after the counts, and capped, so it can never push the real summary out of the comment
    parts.push(
      '> [!CAUTION]',
      `> ${problems.length} problem(s) found; affected entries are missing from this summary.`,
      ...problems.slice(0, maxListedProblems).map(problem => `> - ${code(problem)}`),
      ...(problems.length > maxListedProblems ?
        [`> - _… and ${problems.length - maxListedProblems} more_`]
      : []),
      ''
    );
  }

  // the add/remove tables get at most a quarter each, so the modified details always have room
  const tableBudget = Math.floor(maxChars / 4);
  if (added.length > 0) {
    parts.push(renderTableSection('Added', added, tableBudget));
  }
  if (removed.length > 0) {
    parts.push(renderTableSection('Removed', removed, tableBudget));
  }
  if (modified.length > 0) {
    parts.push(`### Modified (${modified.length})`, '');
  }

  let used = parts.join('\n').length;
  for (const [index, vault] of modified.entries()) {
    const rendered = renderModifiedVault(vault);
    const remaining = modified.length - index;
    const footer = `_… and ${remaining} more modified ${remaining === 1 ? 'vault' : 'vaults'} not shown._\n`;
    if (used + rendered.length + footer.length + 2 > maxChars) {
      parts.push(footer);
      break;
    }
    parts.push(rendered);
    used += rendered.length + 1;
  }

  const output = parts.join('\n');
  if (output.length <= maxChars) {
    return output;
  }
  // the per section budgets should prevent this; never emit an oversized body regardless
  const notice = '\n\n_Summary truncated._';
  return `${output.slice(0, Math.max(0, maxChars - notice.length))}${notice}`;
}

async function start() {
  const args = getRunArgs();
  if (!args.base.trim()) {
    throw new Error('--base must be a git ref or sha');
  }
  if (args.head !== undefined && !args.head.trim()) {
    throw new Error('--head must be a git ref or sha, omit it to use the working tree');
  }

  const [base, head] = await Promise.all([loadSide(args.base), loadSide(args.head)]);
  const markdown = renderDiff(
    buildDiff(base, head, countChangedChainFiles(args.base, args.head)),
    args.maxChars
  );

  if (args.output) {
    await saveString(args.output, markdown);
  } else {
    console.log(markdown);
  }

  // Malformed config is the pull request's problem, not a failure of this tool, so the summary is
  // written either way. Only the head side counts: the base may predate a fix.
  const problems = sideProblems(head);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`Problem: ${problem}`);
    }
    process.exitCode = 2;
  }
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
