import { ArgumentConfig, parse } from 'ts-command-line-args';
import { getAllVaultConfigsByChainId } from './common/config';
import { sortVaultKeys } from './common/vault-fields';
import { saveJson } from './common/files';

type RunArgs = {
  help?: boolean;
  chain?: string;
  status: 'active' | 'eol' | 'paused';
  reason?: string;
  vaults: string[];
  includeRelated: boolean;
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
    optional: true,
  },
  status: {
    type: Status,
    alias: 's',
    description: 'Status to set (active|eol|paused)',
  },
  reason: {
    type: String,
    alias: 'r',
    description: '(retire|pause)Reason code to set',
    optional: true,
  },
  vaults: {
    type: String,
    multiple: true,
    alias: 'v',
    description: 'Vault ids to set the status on',
  },
  includeRelated: {
    type: Boolean,
    alias: 'i',
    description: 'Include related vaults (vault/rp variants)',
    defaultValue: false,
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

  const unmodified = new Set(args.vaults);

  let allVaultsIds = args.vaults;
  if (args.includeRelated) {
    // also add related clm vaults and rp so that we can set status
    // on either the clm, rp or vault and the same status will be set on all related vaults
    const relatedVaults = [
      ...args.vaults.map(vaultId =>
        vaultId.endsWith('-vault') ? vaultId.replace('-vault', '') : vaultId
      ),
      ...args.vaults.map(vaultId =>
        vaultId.endsWith('-rp') ? vaultId.replace('-rp', '') : vaultId
      ),
      ...args.vaults.map(vaultId => `${vaultId}-vault`),
      ...args.vaults.map(vaultId => `${vaultId}-rp`),
    ];
    allVaultsIds = Array.from(new Set([...args.vaults, ...relatedVaults]));
  }

  const allVaultsByChainId = await getAllVaultConfigsByChainId();
  const timestamp = Math.floor(Date.now() / 1000);
  for (const chainId in allVaultsByChainId) {
    if (args.chain && chainId !== args.chain) {
      continue;
    }

    const chainVaults = allVaultsByChainId[chainId];
    const modified = chainVaults.map(oldVault => {
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

      return oldVault;
    });

    if (unmodified.size > 0) {
      console.warn(`[WARN] ${Array.from(unmodified.values()).join(', ')} not found`);
    }

    const modifiedCount = args.vaults.length - unmodified.size;
    if (modifiedCount > 0) {
      await saveJson(`./src/config/vault/${chainId}.json`, modified, 'prettier');
      console.log(`[INFO] ${modifiedCount} vaults modified`);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
