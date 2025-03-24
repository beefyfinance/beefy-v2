import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

/**
 * @dev this is plain JavaScript as we use Vite to run TypeScript and this script may upgrade packages Vite is using
 **/

async function execString(command, passthrough = true) {
  return new Promise((resolve, reject) => {
    console.log(`$ ${command}`);
    const p = exec(command, (error, stdout) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout.trim());
    });
    if (passthrough) {
      p.stdout.pipe(process.stdout);
      p.stderr.pipe(process.stderr);
    }
  });
}

async function execJson(command) {
  const stdout = await execString(command);
  return JSON.parse(stdout);
}

async function dedupeDependencies() {
  await execString('npm dedupe --no-audit');
}

async function cleanInstall() {
  await execString('npm clean-install');
}

async function install() {
  await execString('npm install --no-audit');
}

// Force these packages to be on same version as in direct dependencies
// In theory this is okay as we only update minor versions in this script
const overrides = [
  '@coinbase/wallet-sdk',
  'react',
  'react-dom',
  'viem',
  '@types/react',
  '@types/react-dom',
  'rollup',
  'esbuild',
];

async function updateOverrides() {
  const json = JSON.parse(await readFile('package.json', 'utf-8'));
  const changes = {};

  for (const pkg of overrides) {
    const currentVersion = json.overrides[pkg];
    if (currentVersion) {
      const version = json.dependencies[pkg] || json.devDependencies[pkg] || undefined;
      if (currentVersion !== version) {
        changes[pkg] = version;
      }
    }
  }

  if (Object.keys(changes).length > 0) {
    console.log('Overrides changed:');
    console.log(JSON.stringify(changes, null, 2));
    for (const [key, value] of Object.entries(changes)) {
      if (value) {
        json.overrides[key] = value;
      } else {
        delete json.overrides[key];
      }
    }
    await writeFile('package.json', JSON.stringify(json, null, 2), 'utf-8');
  }
}

async function updateDependencies() {
  const upgraded = await execJson(
    'npx npm-check-updates --target=minor --dep="prod,dev" --peer --jsonUpgraded --upgrade',
    false
  );

  if (Object.keys(upgraded).length === 0) {
    console.log('No minor/patch version updates available');
    return;
  }

  console.log('Dependencies changed:');
  console.log(JSON.stringify(upgraded, null, 2));

  await updateOverrides();
  await install();
  await dedupeDependencies();
  await cleanInstall();
}

await updateDependencies();
