import { type ArgumentConfig, parse } from 'ts-command-line-args';
import { getAllVaultConfigsByChainId, getVaultsForChain } from './common/config.ts';
import { sortVaultKeys } from './common/vault-fields.ts';
import { saveJson } from './common/files.ts';
import { type VaultConfig } from '../src/features/data/apis/config-types.ts';
import { cloneDeep, keyBy } from 'lodash-es';

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
        header: 'npm run setVaultStatus',
        content: 'Update the status of vaults in a chain json file',
      },
    ],
  });
}

type VaultWithTokenAddress = Omit<VaultConfig, 'tokenAddress'> & { tokenAddress: string };

function findRelatedVaults(
  vault: VaultConfig,
  allVaults: VaultConfig[]
): Array<VaultWithTokenAddress> {
  let allRelatedVaults: Array<VaultWithTokenAddress> = [];

  // all vaults that have the input as their underlying token
  // ie: fetches the rp vaults, given a cow vault
  allRelatedVaults = allRelatedVaults.concat(
    allVaults.filter(
      (v): v is VaultWithTokenAddress =>
        !!v.tokenAddress &&
        !!vault.earnedTokenAddress &&
        v.tokenAddress.toLowerCase() === vault.earnedTokenAddress.toLowerCase()
    )
  );

  // all the vault with the same underlying token and
  // where the type of one is "gov" and the other is "standard"
  // ie: fetches the rp vaults, given a classic vault
  allRelatedVaults = allRelatedVaults.concat(
    allVaults.filter(
      (v): v is VaultWithTokenAddress =>
        !!v.tokenAddress &&
        !!vault.tokenAddress &&
        v.tokenAddress.toLowerCase() === vault.tokenAddress.toLowerCase() &&
        v.type !== vault.type &&
        (v.type === 'gov' || vault.type === 'gov') &&
        (v.type === 'standard' || vault.type === 'standard')
    )
  );

  return allRelatedVaults;
}

function applyChange(vault: VaultConfig, args: RunArgs, now: number): VaultConfig {
  const newVault = cloneDeep(vault);
  delete newVault.retireReason;
  delete newVault.retiredAt;
  delete newVault.pauseReason;
  delete newVault.pausedAt;

  if (args.status === 'eol') {
    if (args.reason) {
      return sortVaultKeys({
        ...newVault,
        status: args.status,
        retireReason: args.reason,
        retiredAt: now,
      });
    } else {
      return sortVaultKeys({
        ...newVault,
        status: args.status,
        retiredAt: now,
      });
    }
  } else if (args.status === 'paused') {
    if (args.reason) {
      return sortVaultKeys({
        ...newVault,
        status: args.status,
        pauseReason: args.reason,
        pausedAt: now,
      });
    } else {
      return sortVaultKeys({
        ...newVault,
        status: args.status,
        pausedAt: now,
      });
    }
  } else {
    return sortVaultKeys({
      ...newVault,
      status: args.status,
    });
  }
}

async function updateVaults(vaultsToUpdate: VaultConfig[], chainId: string) {
  const existingVaults = await getVaultsForChain(chainId);
  const vaultsToUpdateById = keyBy(vaultsToUpdate, 'id');
  const modified = existingVaults.map(oldVault => vaultsToUpdateById[oldVault.id] ?? oldVault);
  await saveJson(`./src/config/vault/${chainId}.json`, modified, 'prettier');
  console.log(`[INFO] ${vaultsToUpdate.length} vaults modified`);
}

async function getVaultsByIds(vaultIds: string[]) {
  const existingVaultsByChainId = await getAllVaultConfigsByChainId();
  const res: typeof existingVaultsByChainId = {};
  let foundCount = 0;
  console.log(vaultIds);
  for (const chainId in existingVaultsByChainId) {
    const filtered = existingVaultsByChainId[chainId].filter(vault => vaultIds.includes(vault.id));
    if (filtered.length > 0) {
      res[chainId] = filtered;
      foundCount += filtered.length;
    }
  }

  if (foundCount !== vaultIds.length) {
    console.warn(`[WARN] ${vaultIds.length - foundCount} vaults not found`);
  }
  return res;
}

async function main() {
  const args = getRunArgs();
  if (args.help) {
    console.log(args);
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);

  const vaultsToUpdate = await getVaultsByIds(args.vaults);
  console.log(vaultsToUpdate.length);
  for (const chainId in vaultsToUpdate) {
    const modifiedVaults: VaultConfig[] = [];
    const allVaults = await getVaultsForChain(chainId);

    for (const vault of vaultsToUpdate[chainId]) {
      const newVault = applyChange(vault, args, timestamp);
      modifiedVaults.push(newVault);

      if (args.includeRelated && vault.earnedTokenAddress) {
        const relatedVaults = findRelatedVaults(vault, allVaults);
        for (const relatedVault of relatedVaults) {
          modifiedVaults.push(applyChange(relatedVault, args, timestamp));
        }
      }
    }

    await updateVaults(modifiedVaults, chainId);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
