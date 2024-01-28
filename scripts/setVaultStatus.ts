import { ArgumentConfig, parse } from 'ts-command-line-args';
import { getChain, getVaultsForChain } from './common/config';
import { sortVaultKeys } from './common/vault-fields';
import { saveJson } from './common/files';

type RunArgs = {
  help?: boolean;
  chain: string;
  status: 'active' | 'eol' | 'paused';
  reason?: string;
  vaults: string[];
};

function Status(input: unknown): RunArgs['status'] {
  if (input === 'active' || input === 'eol' || input === 'paused') {
    return input;
  }

  throw new Error('Invalid status');
}

const runArgsConfig: ArgumentConfig<RunArgs> = {
  help: {
    type: Boolean,
    alias: 'h',
    description: 'Display this usage guide.',
    optional: true,
  },
  chain: {
    type: String,
    alias: 'c',
    description: 'Chain json file to process',
  },
  status: {
    type: Status,
    alias: 's',
    description: 'Status to set (active|eol|paused)',
  },
  reason: {
    type: String,
    alias: 'r',
    description: '{retire|pause}Reason code to set',
    optional: true,
  },
  vaults: {
    type: String,
    multiple: true,
    alias: 'v',
    description: 'Vault ids to set the status on',
  },
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'yarn setVaultStatus',
        content: 'Update the status of vaults in a chain json file',
      },
    ],
  });
}

async function main() {
  const args = getRunArgs();
  if (args.help) {
    console.log(args);
    return;
  }

  const chain = getChain(args.chain);
  const unmodified = new Set(args.vaults);
  const allVaults = await getVaultsForChain(args.chain);
  const timestamp = Math.floor(Date.now() / 1000);
  const modified = allVaults.map(oldVault => {
    if (unmodified.has(oldVault.id)) {
      unmodified.delete(oldVault.id);

      delete oldVault.retireReason;
      delete oldVault.retiredAt;
      delete oldVault.pauseReason;
      delete oldVault.pausedAt;

      if (args.status === 'eol') {
        if (args.reason) {
          return sortVaultKeys({
            ...oldVault,
            status: args.status,
            retireReason: args.reason,
            retiredAt: timestamp,
          });
        } else {
          return sortVaultKeys({
            ...oldVault,
            status: args.status,
            retiredAt: timestamp,
          });
        }
      } else if (args.status === 'paused') {
        if (args.reason) {
          sortVaultKeys({
            ...oldVault,
            status: args.status,
            pauseReason: args.reason,
            pausedAt: timestamp,
          });
        } else {
          return sortVaultKeys({
            ...oldVault,
            status: args.status,
            pausedAt: timestamp,
          });
        }
      } else {
        return sortVaultKeys({
          ...oldVault,
          status: args.status,
        });
      }
    }

    return sortVaultKeys(oldVault);
  });

  if (unmodified.size > 0) {
    console.warn(`[WARN] ${Array.from(unmodified.values()).join(', ')} not found on ${chain.name}`);
  }

  const modifiedCount = args.vaults.length - unmodified.size;
  if (modifiedCount > 0) {
    await saveJson(`./src/config/vault/${args.chain}.json`, modified, 'prettier');
    console.log(`[INFO] ${modifiedCount} vaults modified`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
