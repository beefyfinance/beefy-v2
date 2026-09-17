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
/** Caps so one vault cannot consume, or blow past, the whole comment budget */
const maxRowsPerVault = 200;
const maxVaultsPerStatusGroup = 200;
const maxFooterChars = 80;
const maxListedProblems = 10;
/**
 * Retiring or pausing touches only these, on a lot of vaults at once, so a details block each is
 * mostly the same three rows repeated. Grouped by what the change did instead.
 */
const statusFields = ['status', 'retireReason', 'pauseReason', 'retiredAt', 'pausedAt'];
/** Of those, the ones that differ per vault, so they cannot be part of a group's shared summary */
const perVaultStatusFields = ['retiredAt', 'pausedAt'];
/** Section order; the last one covers a status field change that is none of the others */
const statusTitles = ['Retired', 'Unretired', 'Paused', 'Unpaused', 'Status changed'] as const;

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

type StatusTitle = (typeof statusTitles)[number];

/** Vaults whose only changes are to statusFields, sharing one identical transition */
type StatusGroup = {
  title: StatusTitle;
  /** the changes every vault in the group makes, identically; the group is keyed on them */
  shared: FieldChange[];
  /** perVaultStatusFields changed by at least one member, rendered as a column each */
  columns: string[];
  vaults: ModifiedVault[];
};

/** Every group that did the same thing, however it was reasoned or timestamped */
type StatusSection = {
  title: StatusTitle;
  groups: StatusGroup[];
  vaultCount: number;
};

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf-8', maxBuffer: 256 * 1024 * 1024 });
}

function chainIdFromPath(path: string): string {
  return basename(path, '.json');
}

type ChainFiles = {
  paths: string[];
  /** chain -> why it was not read; excluded on both sides so it cannot look like a mass removal */
  skipped: Map<string, string>;
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
  // if the directory itself is a symlink or a file, ls-tree returns nothing
  const dirType = git(['cat-file', '-t', `${ref}:${vaultConfigDir}`]).trim();
  if (dirType !== 'tree') {
    throw new Error(`${vaultConfigDir} is a ${dirType}, not a directory, at ${ref}`);
  }

  const output = git(['ls-tree', '-z', ref, '--', `${vaultConfigDir}/`]);
  const paths: string[] = [];
  const skipped = new Map<string, string>();

  for (const entry of output.split('\0')) {
    const match = /^(\d{6}) (\w+) [0-9a-f]+\t(.*)$/s.exec(entry);
    if (!match) {
      continue;
    }
    const [, mode, type, path] = match;
    if (!path.endsWith('.json')) {
      // silently ignoring these is how a nested or oddly named config file goes unmentioned
      skipped.set(chainIdFromPath(path), `${path} is not a file this tool reads`);
      continue;
    }
    if (!/^[a-z0-9_-]+\.json$/i.test(basename(path))) {
      // an unexpected name would otherwise become a chain id and be rendered as one
      skipped.set(chainIdFromPath(path), `${path} is not a recognisable chain file name`);
    } else if (type === 'blob' && (mode === '100644' || mode === '100755')) {
      paths.push(path);
    } else {
      // a symlink or submodule would otherwise vanish from both sides without a word
      skipped.set(chainIdFromPath(path), `${path} is not a regular file (mode ${mode})`);
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
      // the app keys these by id, where the last entry wins, so compare the one it will use
      notes.push(`${chain} has more than one vault with id ${vault.id}; only the last is compared`);
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
      { paths: await listChainFilesOnDisk(), skipped: new Map<string, string>() }
    : listChainFilesAtRef(ref);
  const vaults: VaultsByKey = new Map();
  const broken = new Map(listed.skipped);
  const notes: string[] = [];

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
        Object.hasOwn(previous, key) ? previous[key] : undefined,
        Object.hasOwn(current, key) ? current[key] : undefined,
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
  // escaped rather than deleted or folded to a space: two values that really do differ must never
  // render as the same cell. \p{Cf} covers the tag block and the rest of the format characters.
  return value.replace(
    // eslint-disable-next-line no-control-regex, no-misleading-character-class -- deliberate
    /\p{Cf}|[\u0000-\u0008\u000A-\u001F\u007F\u115F\u1160\u17B4\u17B5\u200B\u2065\u3164\uFFA0\uFFF9-\uFFFB]/gu,
    character => `<U+${character.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0')}>`
  );
}

/** Renders a value as a markdown code span.*/
function code(value: string, start = 0): string {
  const text = stripUnsafe(truncateValue(value, start));
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
  return stripUnsafe(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** The text code() would render, so both sides of a change can be windowed consistently */
function valueText(value: unknown, showType = false): string {
  if (value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return showType || value !== value.trim() ? JSON.stringify(value) : value;
  }
  return JSON.stringify(value) ?? typeof value;
}

/**
 * Each side of a change is cut to maxValueChars on its own, so two long values that differ only
 * past the cut would render as identical cells. Window both around the first difference instead.
 */
function divergenceStart(before: unknown, after: unknown, showType: boolean): number {
  const a = valueText(before, showType);
  const b = valueText(after, showType);
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

/** Otherwise 0 and "0", or true and "true", render as two identical looking cells */
function needsType({ before, after }: FieldChange): boolean {
  return (
    before !== undefined &&
    after !== undefined &&
    (typeof before !== typeof after || (before === null) !== (after === null))
  );
}

/** One before/after pair, windowed and typed consistently, ready to put in table cells */
function renderChangePair(change: FieldChange): [before: string, after: string] {
  const showType = needsType(change);
  const start = divergenceStart(change.before, change.after, showType);
  return [
    cell(renderValue(change.before, change.path, start, showType)),
    cell(renderValue(change.after, change.path, start, showType)),
  ];
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
    ...changes
      .slice(0, maxRowsPerVault)
      .map(change => `| ${cell(code(change.path))} | ${renderChangePair(change).join(' | ')} |`),
    ...(changes.length > maxRowsPerVault ?
      [`| _… and ${changes.length - maxRowsPerVault} more fields not shown_ | | |`]
    : []),
    '',
    '</details>',
    '',
  ].join('\n');
}

function isStatusOnlyChange(changes: FieldChange[]): boolean {
  return changes.every(change => statusFields.includes(change.path));
}

/** Identifies a change exactly; the booleans keep an unset value distinct from a null one */
function changeKey({ path, before, after }: FieldChange): string {
  return JSON.stringify([path, before === undefined, before, after === undefined, after]);
}

/** What a status change did, since `active` → `eol` reads as a diff long before it reads as retired */
function statusTitle(shared: FieldChange[]): StatusTitle {
  const status = shared.find(change => change.path === 'status');
  if (status) {
    if (status.after === 'eol') {
      return 'Retired';
    }
    if (status.after === 'paused') {
      return 'Paused';
    }
    if (status.after === 'active') {
      if (status.before === 'eol') {
        return 'Unretired';
      }
      if (status.before === 'paused') {
        return 'Unpaused';
      }
    }
  }
  // an unrecognised status, or only a reason or a timestamp moving, still has to be reported
  return 'Status changed';
}

/**
 * Buckets status only vaults by the transition they share, so a batch retirement is one block
 * naming the transition once rather than the same three rows per vault. Timestamps are left out of
 * the key: they are set per vault, seconds apart, and would otherwise split every batch up again.
 */
function buildStatusSections(vaults: ModifiedVault[]): StatusSection[] {
  const groups = new Map<string, StatusGroup>();

  for (const modified of vaults) {
    const shared = modified.changes.filter(change => !perVaultStatusFields.includes(change.path));
    const key = shared.map(changeKey).join('\n');
    let group = groups.get(key);
    if (!group) {
      group = { title: statusTitle(shared), shared, columns: [], vaults: [] };
      groups.set(key, group);
    }
    for (const path of perVaultStatusFields) {
      if (!group.columns.includes(path) && modified.changes.some(change => change.path === path)) {
        group.columns.push(path);
      }
    }
    group.vaults.push(modified);
  }

  return statusTitles
    .map(title => {
      // biggest batch first, so a section stays useful when the budget cuts it short
      const matching = [...groups.values()]
        .filter(group => group.title === title)
        .sort(
          (a, b) => b.vaults.length - a.vaults.length || byChainThenId(a.vaults[0], b.vaults[0])
        );
      return {
        title,
        groups: matching,
        vaultCount: matching.reduce((count, group) => count + group.vaults.length, 0),
      };
    })
    .filter(section => section.groups.length > 0);
}

/** renderValue's markdown is not parsed inside a summary, so those values are rendered as html */
function htmlValue(value: unknown, path: string): string {
  if (value === undefined) {
    return '<em>unset</em>';
  }
  if (value === '') {
    return '<em>empty string</em>';
  }
  const timestamp =
    typeof value === 'number' && isTimestampPath(path) ? renderTimestamp(value) : undefined;
  return `<code>${inlineHtml(truncateValue(timestamp ?? valueText(value)))}</code>`;
}

function renderStatusGroup({ shared, columns, vaults }: StatusGroup): string {
  const transitions = shared
    .map(change => {
      // the section heading already says what a status transition means, so it goes unlabelled
      const label = change.path === 'status' ? '' : `<code>${inlineHtml(change.path)}</code> `;
      return `${label}${htmlValue(change.before, change.path)} → ${htmlValue(change.after, change.path)}`;
    })
    .join(' · ');
  const stamps = `${columns.map(path => `<code>${inlineHtml(path)}</code>`).join(', ')} changed`;
  const shown = vaults.slice(0, maxVaultsPerStatusGroup);

  return [
    '<details>',
    `<summary>${vaults.length} ${vaults.length === 1 ? 'vault' : 'vaults'} — ${transitions || stamps}</summary>`,
    '',
    `| Vault ID | Chain |${columns.map(path => ` ${code(path)} |`).join('')}`,
    `| --- | --- |${columns.map(() => ' --- |').join('')}`,
    ...shown.map(({ chain, vault, changes }) => {
      const cells = columns.map(path => {
        const change = changes.find(candidate => candidate.path === path);
        if (!change) {
          return ' |';
        }
        const [before, after] = renderChangePair(change);
        // just the new value where there was none before, which is the whole column's usual case
        return change.before === undefined ? ` ${after} |` : ` ${before} → ${after} |`;
      });
      return `| ${cell(code(vault.id))} | ${cell(code(chain))} |${cells.join('')}`;
    }),
    ...(vaults.length > maxVaultsPerStatusGroup ?
      [
        `| _… and ${vaults.length - maxVaultsPerStatusGroup} more not shown_ | |${columns.map(() => ' |').join('')}`,
      ]
    : []),
    '',
    '</details>',
    '',
  ].join('\n');
}

/** Renders the status sections, stopping before they exceed their shared slice of the comment */
function renderStatusSections(sections: StatusSection[], budget: number): string {
  const parts: string[] = [];
  let used = 0;

  for (const section of sections) {
    const heading = `### ${section.title} (${section.vaultCount})`;
    parts.push(heading, '');
    used += heading.length + 2;

    let notShown = 0;
    for (const group of section.groups) {
      const rendered = renderStatusGroup(group);
      // continue, not break: one oversized group must not delete every group after it
      if (used + rendered.length + maxFooterChars > budget) {
        notShown += group.vaults.length;
        continue;
      }
      parts.push(rendered);
      used += rendered.length + 1;
    }

    if (notShown > 0) {
      parts.push(`_… and ${notShown} more not shown._`, '');
      used += maxFooterChars;
    }
  }

  return parts.join('\n');
}

function byChainThenId(a: VaultLocation, b: VaultLocation): number {
  return a.chain.localeCompare(b.chain) || a.vault.id.localeCompare(b.vault.id);
}

type Diff = {
  added: VaultLocation[];
  removed: VaultLocation[];
  modified: ModifiedVault[];
  /** vaults that only changed statusFields, split out of modified and grouped by transition */
  statusOnly: ModifiedVault[];
  /** chain -> why it could not be compared */
  broken: Map<string, string>;
  /** entries skipped on either side, which the reader still needs to know about */
  notes: string[];
  /** chain files that differ textually, so a reorder-only change is not reported as nothing */
  filesTouched: number;
  /** vaults that threw while being compared; head side problems must fail the step */
  comparisonFailures: string[];
};

function buildDiff(base: SideLoad, head: SideLoad, filesTouched: number): Diff {
  // a chain that failed to load on either side would otherwise look like a mass add or delete
  const broken = new Map([...base.broken, ...head.broken]);
  const notes = [...new Set([...base.notes, ...head.notes])];
  const comparisonFailures: string[] = [];

  const usable = (entry: VaultLocation) => !broken.has(entry.chain);

  const added: VaultLocation[] = [];
  const removed: VaultLocation[] = [];
  const modified: ModifiedVault[] = [];
  const statusOnly: ModifiedVault[] = [];

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
        const entry = { ...current, before: previous.vault, changes };
        (isStatusOnlyChange(changes) ? statusOnly : modified).push(entry);
      }
    } catch (e) {
      comparisonFailures.push(
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
  statusOnly.sort(byChainThenId);

  return {
    added,
    removed,
    modified,
    statusOnly,
    broken,
    notes: [...notes, ...comparisonFailures],
    filesTouched,
    comparisonFailures,
  };
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
      lines.push('', footer.trimStart());
      break;
    }
    lines.push(row);
    used += row.length + 1;
  }

  lines.push('');
  return lines.join('\n');
}

function renderDiff(
  { added, removed, modified, statusOnly, broken, notes, filesTouched }: Diff,
  maxChars: number
): string {
  const parts = [commentMarker, '## Vault config changes', ''];
  const problems = [
    ...[...broken].map(([chain, why]) => `${chain} could not be read: ${why}`),
    ...notes,
  ];
  const changed =
    added.length > 0 || removed.length > 0 || modified.length > 0 || statusOnly.length > 0;
  const statusSections = buildStatusSections(statusOnly);

  if (!changed && problems.length === 0) {
    parts.push(
      filesTouched > 0 ?
        `No vault config changes detected, though ${filesTouched} file(s) under \`${vaultConfigDir}\` differ. Check the diff for renames, reordering or files this tool does not read.`
      : 'No vault config changes detected.',
      ''
    );
    return parts.join('\n');
  }

  if (changed) {
    const chains = [
      ...new Set([...added, ...removed, ...modified, ...statusOnly].map(({ chain }) => chain)),
    ]
      .sort()
      .map(chain => code(chain));
    const shownChains = chains.slice(0, maxListedChains).join(', ');
    const moreChains =
      chains.length > maxListedChains ? ` and ${chains.length - maxListedChains} more` : '';
    const counts = [
      added.length > 0 && `**${added.length}** added`,
      removed.length > 0 && `**${removed.length}** removed`,
      modified.length > 0 && `**${modified.length}** modified`,
      ...statusSections.map(section => `**${section.vaultCount}** ${section.title.toLowerCase()}`),
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

  // the add/remove/status sections get at most a quarter each, so modified always has room
  const tableBudget = Math.floor(maxChars / 4);
  if (added.length > 0) {
    parts.push(renderTableSection('Added', added, tableBudget));
  }
  if (removed.length > 0) {
    parts.push(renderTableSection('Removed', removed, tableBudget));
  }
  if (statusSections.length > 0) {
    parts.push(renderStatusSections(statusSections, tableBudget));
  }
  if (modified.length > 0) {
    parts.push(`### Modified (${modified.length})`, '');
  }

  let used = parts.join('\n').length;
  let notShown = 0;
  for (const vault of modified) {
    const rendered = renderModifiedVault(vault);
    // continue, not break: one oversized vault must not delete every vault after it
    if (used + rendered.length + maxFooterChars > maxChars) {
      notShown++;
      continue;
    }
    parts.push(rendered);
    used += rendered.length + 1;
  }
  if (notShown > 0) {
    parts.push(
      `_… and ${notShown} more modified ${notShown === 1 ? 'vault' : 'vaults'} not shown._\n`
    );
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
  const diff = buildDiff(base, head, countChangedChainFiles(args.base, args.head));
  const markdown = renderDiff(diff, args.maxChars);

  if (args.output) {
    await saveString(args.output, markdown);
  } else {
    console.log(markdown);
  }

  // Malformed config is the pull request's problem, not a failure of this tool, so the summary is
  // written either way. Only the head side counts: the base may predate a fix.
  const problems = [...sideProblems(head), ...diff.comparisonFailures];
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
