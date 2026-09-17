import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

/** `panda codegen` writes `.cache/styles`, but only `npm start` and `npm run build` run it */
export default function setup() {
  const outDir = resolve(import.meta.dirname, '.cache/styles');
  if (existsSync(outDir)) {
    return;
  }

  // `@pandacss/dev` does not export `./bin.js`, so resolve the package and go next to it
  const packageJson = createRequire(import.meta.url).resolve('@pandacss/dev/package.json');
  const bin = resolve(dirname(packageJson), 'bin.js');
  const result = spawnSync(process.execPath, [bin, 'codegen'], { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(
      `panda codegen failed (exit ${result.status}); run \`npx panda codegen\` and retry`
    );
  }
}
