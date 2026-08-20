// Generates .design-sync/shims/<helper>.ts — copies of src/helpers/*.ts whose
// Vite-only `import.meta.glob()` calls are replaced by static imports. esbuild
// leaves import.meta empty, so the untouched originals throw at bundle load and
// take every component with them. The tsconfig at .design-sync/tsconfig.sync.json
// redirects the components' relative helper imports here.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, resolve, dirname, relative, basename } from 'node:path';

const HELPERS = 'src/helpers';
const OUT = '.design-sync/shims';
// single-assets is 27MB/1379 files — inlining it all as data URLs is not viable.
// Take the smallest files up to this budget so the common tokens still resolve.
const ASSET_BUDGET = 1_200_000;

const walk = (d, out = []) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

// Expand a Vite glob pattern (only the forms this repo uses: `*` and `**`, with
// an optional `(a|b|c)` extension alternation) into matching files.
function expand(fromDir, pattern) {
  const [, prefix, ext] = /^(.*?)\*(?:\*)?\/?\*?\.?\(?([\w|]*)\)?$/.exec(pattern) ?? [];
  const base = resolve(fromDir, pattern.replace(/\/?\*.*$/, ''));
  const exts = (pattern.match(/\.\(?([\w|]+)\)?$/)?.[1] ?? '').split('|').filter(Boolean);
  const deep = pattern.includes('**');
  let files;
  try {
    files = deep ? walk(base) : readdirSync(base).map(f => join(base, f)).filter(f => statSync(f).isFile());
  } catch {
    return [];
  }
  return files.filter(f => !exts.length || exts.includes(f.split('.').pop()));
}

// Find `import.meta.glob...(` and return [start, end) of the whole call.
function findGlobCall(src, from = 0) {
  const i = src.indexOf('import.meta.glob', from);
  if (i < 0) return null;
  const open = src.indexOf('(', i);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === '(') depth++;
    else if (src[j] === ')' && --depth === 0) return { start: i, end: j + 1, text: src.slice(i, j + 1) };
  }
  return null;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// @repo/styles/<name> → panda's generated .cache/styles/<name>/index.mjs. The
// converter's path resolver only tries `/index.js`, never `/index.mjs`, and its
// path targets must end in `*` — so alias the whole family through these
// one-line re-exports instead.
mkdirSync(join(OUT, 'styles'), { recursive: true });
for (const name of ['css', 'jsx', 'tokens', 'types', 'patterns']) {
  const target = resolve('.cache/styles', name, 'index.mjs');
  writeFileSync(join(OUT, 'styles', `${name}.ts`), `export * from ${JSON.stringify(target)};\n`);
}

// `import Icon from '…/foo.svg?react'` is vite-plugin-svgr: a React component.
// esbuild has no such loader and resolves the path to a data-URL *string*, so
// <Icon/> renders as an invalid tag name and paints nothing. Emit a real
// component per imported svg, at `<name>.svg?react.tsx` so the converter's
// path resolver (which appends .tsx) finds it.
const svgrDir = join(OUT, 'svgr');
const attrMap = { class: 'className', 'clip-path': 'clipPath', 'clip-rule': 'clipRule', 'fill-opacity': 'fillOpacity', 'fill-rule': 'fillRule', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity', 'stroke-dasharray': 'strokeDasharray', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'stroke-miterlimit': 'strokeMiterlimit', 'stroke-opacity': 'strokeOpacity', 'stroke-width': 'strokeWidth', 'xmlns:xlink': 'xmlnsXlink' };
const svgrSeen = new Set();
let svgrCount = 0;
for (const file of walk('src')) {
  if (!/\.tsx?$/.test(file)) continue;
  for (const m of readFileSync(file, 'utf8').matchAll(/['"]((?:\.\.\/)+images\/[^'"]+\.svg)\?react['"]/g)) {
    const abs = resolve(dirname(file), m[1]);
    const rel = relative(resolve('src/images'), abs).split('\\').join('/');
    if (svgrSeen.has(rel)) continue;
    svgrSeen.add(rel);
    let svg;
    try { svg = readFileSync(abs, 'utf8'); } catch { continue; }
    const open = /<svg\b([^>]*)>/i.exec(svg);
    if (!open) continue;
    const inner = svg.slice(open.index + open[0].length).replace(/<\/svg>\s*$/i, '');
    const attrs = {};
    for (const a of open[1].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[attrMap[a[1]] ?? a[1]] = a[2];
    // Mirror tools/bundle/svgr.ts: icons under images/icons/mui/ are built by
    // the mui-compat plugin, which merges a `mui-svg` class (that class is what
    // sizes them — 1em/1em in panda.config.ts) and marks them decorative.
    // Without it MUI icons have viewBox but no intrinsic size and fill their box.
    const isMui = rel.startsWith('icons/mui/');
    if (isMui) Object.assign(attrs, { focusable: 'false', 'aria-hidden': 'true' });
    const dest = join(svgrDir, `${rel}?react.tsx`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, [
      `import { createElement } from 'react';`,
      `const attrs = ${JSON.stringify(attrs)};`,
      `const inner = ${JSON.stringify(inner)};`,
      `export default function Svg({ className, ...props }: Record<string, any>) {`,
      isMui
        ? `  return createElement('svg', { ...attrs, ...props, className: ['mui-svg', className].filter(Boolean).join(' '), dangerouslySetInnerHTML: { __html: inner } });`
        : `  return createElement('svg', { ...attrs, ...props, className, dangerouslySetInnerHTML: { __html: inner } });`,
      `}`,
    ].join('\n') + '\n');
    svgrCount++;
  }
}
console.log(`svgr: ${svgrCount} svg components`);

const generated = [];
for (const file of readdirSync(HELPERS).map(f => join(HELPERS, f)).filter(f => statSync(f).isFile())) {
  // Comments are stripped before scanning: globLoader.ts documents
  // `import.meta.glob<T>(path, {` in a docblock, which the call finder would
  // otherwise treat as a real call and mangle.
  let src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  if (!src.includes('import.meta.glob')) continue;
  const imports = [];
  let out = '';
  let cursor = 0;
  let n = 0;
  for (let call; (call = findGlobCall(src, cursor)); ) {
    const pattern = /['"]([^'"]+)['"]/.exec(call.text)?.[1] ?? '';
    // .svg/.png only: those are the loaders the converter configures. Config
    // globs (which load .ts modules, not asset URLs) fall through to empty.
    let files = expand(dirname(file), pattern).filter(f => /\.(svg|png)$/.test(f));
    if (files.length) {
      files.sort((a, b) => statSync(a).size - statSync(b).size);
      let budget = ASSET_BUDGET;
      files = files.filter(f => (budget -= statSync(f).size) > 0);
      files.sort();
    } else {
      files = [];
    }
    const entries = files.map(f => {
      const id = `__g${n}_${imports.length}`;
      imports.push(`import ${id} from ${JSON.stringify(resolve(f))};`);
      // Key must match what the original glob would have produced: the pattern's
      // own relative form, as the module's key mapper expects.
      const key = './' + relative(dirname(file), resolve(f)).split('\\').join('/');
      return `  ${JSON.stringify(key.replace(/^\.\//, ''))}: ${id},`;
    });
    out += src.slice(cursor, call.start) + `{\n${entries.join('\n')}\n}`;
    cursor = call.end;
    n++;
  }
  out += src.slice(cursor);
  const body = imports.join('\n') + '\n' + out;
  // Helper imports inside the shim are one level deeper than the original.
  writeFileSync(join(OUT, basename(file)), body.replace(/(from\s+['"])\.\/(?!\.)/g, '$1../../src/helpers/'));
  generated.push(`${basename(file)} (${imports.length} assets)`);
}
console.log(generated.join('\n'));
