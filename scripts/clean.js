import { rm } from 'fs/promises';
import { join } from 'path';
import { access, constants } from 'node:fs/promises';

/**
 * @dev this is plain JavaScript as we use Vite to run TypeScript and this script deletes the Vite cache
 **/

const rootPath = join(import.meta.dirname, '..');

async function folderExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {}
  return false;
}

async function cleanDirectory(childPath, reason) {
  const exists = await folderExists(join(rootPath, childPath));
  if (exists) {
    try {
      await rm(join(rootPath, childPath), { recursive: true });
      console.log(`${reason}: ✔️`);
    } catch {
      console.error(`${reason}: ❌`);
    }
  }
}

await Promise.all([
  cleanDirectory('build/', 'Build output'),
  cleanDirectory('.cache/', 'Generated code, linting and script cache'),
  cleanDirectory('node_modules/.cache/', 'Node modules cache'),
  cleanDirectory('node_modules/.vite/', 'Vite esbuild cache'),
  cleanDirectory('node_modules/.vite-temp/', 'Vite temporary files'),
]);
