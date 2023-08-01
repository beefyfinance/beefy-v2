import type { ArgumentConfig } from 'ts-command-line-args';
import { parse } from 'ts-command-line-args';
import commandLineUsage from 'command-line-usage';
import { addressBook } from 'blockchain-addressbook';
import * as path from 'path';
import { exec } from 'child_process';
import { createInterface, Interface } from 'readline';
import { BoostConfig, VaultConfig } from '../src/features/data/apis/config-types';
import { loadJson, saveJson } from './common/utils';
import { sortVaultKeys } from './common/vault-fields';
import fs from 'fs';
import { mkdir } from 'fs/promises';

type Chain = keyof typeof addressBook;

type YarnInfo = {
  name: string;
  version: string;
  versions: string[];
  'dist-tags': {
    latest: string;
  };
  time: Record<string, string>;
};

type YarnList = {
  type: 'list';
  trees: { name: string }[];
};

type YarnJson<T> = {
  type: 'inspect';
  data: T;
};

type PackageJson = {
  dependencies: Record<string, string>;
};

interface RunArgs {
  help?: boolean;
  fromId: string;
  toId: string;
  chain: Chain;
  copyImage?: boolean;
}

function isChain(input: string): input is Chain {
  return input in addressBook;
}

function ChainType(input: any): Chain | undefined {
  if (input && isChain(input)) {
    return input;
  }

  return undefined;
}

const runArgsConfig: ArgumentConfig<RunArgs> = {
  help: {
    type: Boolean,
    alias: 'h',
    description: 'Display this usage guide.',
    optional: true,
  },
  // @ts-expect-error when not in strict mode
  chain: {
    type: ChainType,
    alias: 'c',
    description: Object.keys(addressBook).join(' | '),
  },
  // @ts-expect-error when not in strict mode
  fromId: {
    type: String,
    alias: 'f',
    description: 'Old token id',
  },
  // @ts-expect-error when not in strict mode
  toId: {
    type: String,
    alias: 't',
    description: 'New token id',
  },
  copyImage: {
    type: Boolean,
    alias: 'i',
    defaultValue: undefined,
    optional: true,
    description: 'Create a copy of old id image for new id',
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'yarn renameTokenId',
        content: 'Helper to update config files when a token id has been changed.',
      },
    ],
  });
}

function run(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else if (stdout) {
        resolve(stdout);
      } else if (stderr) {
        reject(stderr || 'unknown error');
      } else {
        resolve(stdout);
      }
    });
  });
}

async function displayAndRun(cmd: string): Promise<string> {
  console.log(`$ ${cmd}`);
  return await run(cmd);
}

function parseYarn<T>(lines: string, type: string): T {
  for (const line of lines.split('\n')) {
    const json = JSON.parse(line) as YarnJson<unknown>;
    if (json.type === type) {
      return json.data as T;
    }
  }

  throw new Error(`${type} not found`);
}

async function getAddressBookVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageData = await loadJson<PackageJson>(packagePath);
  const installedVersion = packageData.dependencies['blockchain-addressbook'].replace('^', '');

  const infoResult = await run(
    'yarn info blockchain-addressbook --json --non-interactive --no-progress'
  );
  const info = parseYarn<YarnInfo>(infoResult, 'inspect');
  const latestVersion = info.version;

  return {
    current: installedVersion,
    latest: latestVersion,
    isLatest: installedVersion == latestVersion,
  };
}

async function askBoolean(
  rl: Interface,
  question: string,
  defaultValue: boolean
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    rl.question(`${question} [Y|n] (default: ${defaultValue ? 'Y' : 'n'}): `, answer => {
      if (answer.length === 0) {
        resolve(defaultValue);
      }
      if (answer === 'Y') {
        resolve(true);
      }
      if (answer === 'n') {
        resolve(false);
      }

      reject('Invalid input');
    });
  });
}

function toAppChainId(chain: Chain): string {
  return chain === 'one' ? 'harmony' : chain;
}

function makeReplacer(from: string, to: string) {
  return (value: string) => {
    return value === from ? to : value;
  };
}

type VaultReplacement = { vaultId: string; field: string; from: unknown; to: unknown };
type BoostReplacement = { boostId: string; field: string; from: unknown; to: unknown };
type Replacement = VaultReplacement | BoostReplacement;

async function updateVaults(appChainId: string, fromId: string, toId: string, toOracleId: string) {
  const filePath = path.join(__dirname, '..', `src`, 'config', 'vault', `${appChainId}.json`);
  const oldConfig = await loadJson<VaultConfig[]>(filePath);
  const replacer = makeReplacer(fromId, toId);
  const replacements: VaultReplacement[] = [];

  const newConfig = oldConfig.map(oldVault => {
    const newVault: Partial<VaultConfig> = {};

    if (oldVault.oracleId === fromId) {
      newVault['oracleId'] = toOracleId;
      replacements.push({
        vaultId: oldVault.id,
        field: 'oracleId',
        from: oldVault.oracleId,
        to: newVault.oracleId,
      });
    }

    if (oldVault.assets && oldVault.assets.includes(fromId)) {
      newVault['assets'] = oldVault.assets.map(replacer);
      replacements.push({
        vaultId: oldVault.id,
        field: 'assets',
        from: oldVault.assets,
        to: newVault.assets,
      });
    }

    return sortVaultKeys({
      ...oldVault,
      ...newVault,
    });
  });

  if (replacements.length) {
    await saveJson(filePath, newConfig, true);
  }

  return replacements;
}

async function updateBoosts(appChainId: string, fromId: string, toId: string, toOracleId: string) {
  const filePath = path.join(__dirname, '..', `src`, 'config', 'boost', `${appChainId}.json`);
  const oldConfig = await loadJson<BoostConfig[]>(filePath);
  const replacer = makeReplacer(fromId, toId);
  const replacements: BoostReplacement[] = [];

  const newConfig = oldConfig.map(oldBoost => {
    const newBoost: Partial<BoostConfig> = {};

    if (oldBoost.earnedOracleId === fromId) {
      newBoost['earnedOracleId'] = toOracleId;
      replacements.push({
        boostId: oldBoost.id,
        field: 'oracleId',
        from: oldBoost.earnedOracleId,
        to: newBoost.earnedOracleId,
      });
    }

    if (oldBoost.assets && oldBoost.assets.includes(fromId)) {
      newBoost['assets'] = oldBoost.assets.map(replacer);
      replacements.push({
        boostId: oldBoost.id,
        field: 'assets',
        from: oldBoost.assets,
        to: newBoost.assets,
      });
    }

    return {
      ...oldBoost,
      ...newBoost,
    };
  });

  if (replacements.length) {
    await saveJson(filePath, newConfig, true);
  }

  return replacements;
}

async function updateConfigs(
  appChainId: string,
  fromId: string,
  toId: string,
  toOracleId: string
): Promise<Replacement[]> {
  return (
    await Promise.all([
      updateVaults(appChainId, fromId, toId, toOracleId),
      updateBoosts(appChainId, fromId, toId, toOracleId),
    ])
  ).flat();
}

async function fileExists(path: string) {
  return new Promise<boolean>(resolve => {
    fs.access(path, fs.constants.F_OK, err => {
      resolve(!err);
    });
  });
}

async function copyFile(from: string, to: string) {
  return new Promise<void>((resolve, reject) => {
    fs.copyFile(from, to, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function assetImageExists(appChainId: string, id: string) {
  const possibleFilenames = ['png', 'svg', 'webp', 'jpeg', 'jpg'].map(ext => `${id}.${ext}`);
  const possiblePaths = [`src/images/single-assets/${appChainId}`, 'src/images/single-assets/']
    .map(folder => path.join(__dirname, '..', folder))
    .map(folder => possibleFilenames.map(filename => path.join(folder, filename)))
    .flat();

  const results = await Promise.all(possiblePaths.map(fileExists));
  for (const i in results) {
    const exists = results[i];
    if (exists) {
      return possiblePaths[i];
    }
  }

  return false;
}

async function makeDirIfNotExists(path) {
  const exists = await fileExists(path);
  if (!exists) {
    return await mkdir(path, { recursive: true });
  }
}

async function start() {
  const { fromId, toId, chain, copyImage } = getRunArgs();
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const maybeOldToken = addressBook[chain].tokens[fromId];
    const maybeNewToken = addressBook[chain].tokens[toId];

    if (!maybeNewToken) {
      console.error(`New token id "${toId}" not found in addressbook for ${chain}`);
      const { current, latest, isLatest } = await getAddressBookVersion();
      if (isLatest) {
        console.log(`blockchain-addressbook is at latest version ${latest}`);
        return 1;
      }

      const shouldUpdate = await askBoolean(
        rl,
        `Update from version ${current} to ${latest}?`,
        true
      );
      if (shouldUpdate) {
        await displayAndRun(`yarn add blockchain-addressbook@^${latest}`);
        console.log('Try running again with updated addressbook.');
        return 0;
      }

      return 2;
    }

    if (maybeOldToken) {
      console.warn(
        `Old token still exists - id: ${fromId}, symbol: ${maybeOldToken.symbol}, address: ${maybeOldToken.address}`
      );
      const shouldContinue = await askBoolean(rl, `Continue?`, false);
      if (!shouldContinue) {
        return 3;
      }
    }

    const appChainId = toAppChainId(chain);
    const replacements = await updateConfigs(
      appChainId,
      fromId,
      toId,
      maybeNewToken.oracleId || toId
    );
    if (!replacements.length) {
      console.error(`No replacements found.`);
      return 4;
    }

    console.log(`${replacements.length} replacements made.`);
    console.dir(replacements);

    await displayAndRun(`yarn lint-staged`);

    const newAsset = await assetImageExists(appChainId, toId);
    if (newAsset) {
      console.log(`Asset exists at ${newAsset}`);
      return 0;
    }

    const oldAsset = await assetImageExists(appChainId, fromId);
    if (!oldAsset) {
      if (copyImage) {
        console.error(`Can not find asset for ${fromId} to copy`);
        return 5;
      } else {
        console.log(`Can not find asset for ${fromId}.`);
        return 0;
      }
    }

    let shouldCopyImage = copyImage;
    const newAssetFolder = path.join(__dirname, '..', `src/images/single-assets/${appChainId}/`);
    const newAssetPath = path.join(newAssetFolder, `${toId}${path.extname(oldAsset)}`);
    if (shouldCopyImage === undefined) {
      shouldCopyImage = await askBoolean(rl, `Copy ${oldAsset} to ${newAssetPath}?`, true);
    }

    if (!shouldCopyImage) {
      console.log(`Make sure to manually add an image for ${toId}`);
      return 0;
    }

    console.log('Copying...');
    await makeDirIfNotExists(newAssetFolder);
    await copyFile(oldAsset, newAssetPath);
    await displayAndRun(`git add ${newAssetPath}`);
    console.log('Done.');
  } catch (e) {
    console.error(e);
    return -2;
  } finally {
    rl.close();
  }

  return 0;
}

start()
  .then(code => process.exit(code))
  .catch(e => {
    console.error(e);
    process.exit(-1);
  });
