import { type ArgumentConfig, parse } from 'ts-command-line-args';
import {
  addressBookToAppId,
  appToAddressBookId,
  getAllVaultConfigsByChainId,
  getVaultsForChain,
} from './common/config.ts';
import { sortVaultKeys } from './common/vault-fields.ts';
import { saveJson } from './common/files.ts';
import { type VaultConfig } from '../src/features/data/apis/config-types.ts';
import { cloneDeep, isEqual, keyBy, uniqBy } from 'lodash-es';
import {
  PAUSE_REASONS,
  type PauseReason,
  RETIRE_REASONS,
  type RetireReason,
} from '../src/features/data/entities/vault.ts';
import { isOneOf } from '../src/features/data/utils/array-utils.ts';

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
    description:
      'Only look for vaults on this chain (required for chains excluded from validation)',
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
    description:
      '(retire|pause)Reason code, required for eol/paused, see RETIRE_REASONS / PAUSE_REASONS',
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

type StatusChange =
  | { status: 'active' }
  | { status: 'eol'; retireReason: RetireReason }
  | { status: 'paused'; pauseReason: PauseReason };

function parseStatusChange(args: RunArgs): StatusChange {
  if (args.status === 'active') {
    if (args.reason) {
      console.warn(`[WARN] --reason is ignored when setting status to active`);
    }
    return { status: 'active' };
  }

  const validReasons = args.status === 'eol' ? RETIRE_REASONS : PAUSE_REASONS;
  if (!args.reason) {
    throw new Error(
      `--reason is required for ${args.status}, expected one of: ${validReasons.join(', ')}`
    );
  }
  if (args.status === 'eol' && isOneOf(RETIRE_REASONS, args.reason)) {
    return { status: 'eol', retireReason: args.reason };
  }
  if (args.status === 'paused' && isOneOf(PAUSE_REASONS, args.reason)) {
    return { status: 'paused', pauseReason: args.reason };
  }
  throw new Error(
    `Invalid ${args.status} reason "${args.reason}", expected one of: ${validReasons.join(', ')}`
  );
}

function findRelatedVaults(vault: VaultConfig, allVaults: VaultConfig[]): VaultConfig[] {
  let allRelatedVaults: VaultConfig[] = [];

  // all vaults whose contract is the input's deposit token
  // ie: fetches the clm, given a clm vault or rp vault
  allRelatedVaults = allRelatedVaults.concat(
    allVaults.filter(
      v =>
        !!vault.tokenAddress &&
        v.earnContractAddress.toLowerCase() === vault.tokenAddress.toLowerCase()
    )
  );

  // all vaults that have the input's contract as their deposit token
  // ie: fetches the clm vault + rp vault, given a clm
  allRelatedVaults = allRelatedVaults.concat(
    allVaults.filter(
      v =>
        !!v.tokenAddress && v.tokenAddress.toLowerCase() === vault.earnContractAddress.toLowerCase()
    )
  );

  // all the vault with the same underlying token and
  // where the type of one is "gov" and the other is "standard"
  // ie: fetches the rp vault, given a clm vault; or bifi-pool, given bifi-vault
  allRelatedVaults = allRelatedVaults.concat(
    allVaults.filter(
      v =>
        !!v.tokenAddress &&
        !!vault.tokenAddress &&
        v.tokenAddress.toLowerCase() === vault.tokenAddress.toLowerCase() &&
        v.type !== vault.type &&
        (v.type === 'gov' || vault.type === 'gov') &&
        (v.type === 'standard' || vault.type === 'standard')
    )
  );

  // unique by id, exclude source vault
  return uniqBy(allRelatedVaults, v => v.id).filter(v => v.id !== vault.id);
}

function applyChange(vault: VaultConfig, change: StatusChange, now: number): VaultConfig {
  const newVault = cloneDeep(vault);
  delete newVault.retireReason;
  delete newVault.retiredAt;
  delete newVault.pauseReason;
  delete newVault.pausedAt;

  return sortVaultKeys({
    ...newVault,
    ...change,
    ...(change.status === 'eol' ? { retiredAt: now }
    : change.status === 'paused' ? { pausedAt: now }
    : {}),
  });
}

async function updateVaults(vaultsToUpdate: VaultConfig[], chainId: string) {
  const existingVaults = await getVaultsForChain(chainId);
  const vaultsToUpdateById = keyBy(vaultsToUpdate, 'id');
  const modified = existingVaults.map(oldVault => vaultsToUpdateById[oldVault.id] ?? oldVault);
  const changed = modified.filter((vault, i) => !isEqual(vault, existingVaults[i])).length;
  const unchanged = Object.keys(vaultsToUpdateById).length - changed;
  await saveJson(`./src/config/vault/${addressBookToAppId(chainId)}.json`, modified, 'prettier');
  console.log(
    `[INFO] ${chainId}: ${changed} vaults modified${unchanged > 0 ? `, ${unchanged} already up to date` : ''}`
  );
}

async function getVaultsByIds(vaultIds: string[], chain?: string) {
  const existingVaultsByChainId =
    chain ?
      { [appToAddressBookId(chain)]: await getVaultsForChain(chain) }
    : await getAllVaultConfigsByChainId();
  const res: typeof existingVaultsByChainId = {};
  const notFound = new Set(vaultIds);

  for (const chainId in existingVaultsByChainId) {
    const filtered = existingVaultsByChainId[chainId].filter(vault => notFound.has(vault.id));
    if (filtered.length > 0) {
      res[chainId] = filtered;
      filtered.forEach(vault => notFound.delete(vault.id));
    }
  }

  if (notFound.size > 0) {
    throw new Error(
      `Vaults not found${chain ? ` on ${chain}` : ''}: ${Array.from(notFound).join(', ')}`
    );
  }

  return res;
}

async function main() {
  const args = getRunArgs();
  if (args.help) {
    console.log(args);
    return;
  }

  const change = parseStatusChange(args);

  const timestamp = Math.floor(Date.now() / 1000);

  const vaultsToUpdate = await getVaultsByIds(args.vaults, args.chain);

  for (const chainId in vaultsToUpdate) {
    const modifiedVaults: VaultConfig[] = [];
    const allVaults = await getVaultsForChain(chainId);

    for (const vault of vaultsToUpdate[chainId]) {
      const newVault = applyChange(vault, change, timestamp);
      modifiedVaults.push(newVault);

      if (args.includeRelated) {
        const relatedVaults = findRelatedVaults(vault, allVaults);
        for (const relatedVault of relatedVaults) {
          modifiedVaults.push(applyChange(relatedVault, change, timestamp));
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
