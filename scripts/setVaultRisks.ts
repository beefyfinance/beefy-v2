import { type ArgumentConfig, parse } from 'ts-command-line-args';
import {
  type AddressBookChainId,
  appToAddressBookId,
  getAllVaultConfigsByChainId,
  getVaultsForChain,
} from './common/config.ts';
import { sortVaultKeys } from './common/vault-fields.ts';
import { saveJson } from './common/files.ts';
import { type VaultConfig, type VaultRisksConfig } from '../src/features/data/apis/config-types.ts';
import { cloneDeep, keyBy, uniqBy } from 'lodash-es';
import { riskKeys, type RiskKeys } from './common/risks.ts';
import { createCachedFactory, createFactory } from '../src/features/data/utils/factory-utils.ts';
import { isDefined } from '../src/features/data/utils/array-utils.ts';

type RunArgs = {
  help?: boolean;
  chain?: string;
  vaults: string[];
  includeRelated: boolean;
  dryRun: boolean;
  ui: boolean;
} & {
  [K in RiskKeys]?: boolean;
};

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
  vaults: {
    type: String,
    multiple: true,
    alias: 'v',
    description: 'Vault ids to set the risks on',
  },
  includeRelated: {
    type: Boolean,
    alias: 'i',
    description: 'Include related vaults (CLM base/pool/vault if given any one of them)',
    defaultValue: false,
  },
  dryRun: {
    type: Boolean,
    alias: 'd',
    description: 'Simulate the changes without writing to files',
    defaultValue: false,
  },
  ui: {
    type: Boolean,
    alias: 'u',
    description: 'Show interactive UI to select risks per vault',
    defaultValue: false,
  },
  ...(Object.fromEntries(
    riskKeys.map(key => [
      key,
      {
        type: Boolean,
        description: `Set risk ${key} to true/false`,
        optional: true,
      },
    ])
  ) as { [K in RiskKeys]: { type: typeof Boolean; description: string; optional: true } }),
};

function getRunArgs() {
  return parse<RunArgs>(runArgsConfig, {
    helpArg: 'help',
    headerContentSections: [
      {
        header: 'npm run setVaultRisks',
        content: 'Update the risks of vaults in a chain json file',
      },
    ],
  });
}

const platformRiskMap: Record<string, RiskChange> = {
  NO_TIMELOCK: { key: 'notTimelocked', value: true },
};

const tokenRiskMap: Record<string, RiskChange> = {
  NO_TIMELOCK: { key: 'notTimelocked', value: true },
};

type RiskChange = { key: RiskKeys; value: boolean };

type CowcentratedVaultConfig = Omit<VaultConfig, 'type' | 'earnedTokenAddress'> & {
  type: 'cowcentrated';
  earnedTokenAddress: string;
};

function isCowcentratedVault(vault: VaultConfig): vault is CowcentratedVaultConfig {
  return vault.type === 'cowcentrated' && !!vault.earnedTokenAddress;
}

function getVaultWithRelated(vault: VaultConfig, allVaults: VaultConfig[]): Array<VaultConfig> {
  let clm: CowcentratedVaultConfig | undefined;

  // find the CLM
  if (isCowcentratedVault(vault)) {
    clm = vault;
  } else if (vault.tokenAddress) {
    clm = allVaults.find(
      (v): v is CowcentratedVaultConfig =>
        isCowcentratedVault(v) &&
        v.earnedTokenAddress.toLowerCase() === vault.tokenAddress?.toLowerCase()
    );
  }

  if (!clm) {
    return [];
  }

  // Add the Vaults and Pools of the CLM
  return [clm as VaultConfig].concat(
    allVaults.filter(
      v =>
        (v.type === 'standard' || v.type === 'gov') &&
        !!v.tokenAddress &&
        v.tokenAddress.toLowerCase() === clm.earnedTokenAddress.toLowerCase()
    )
  );
}

function applyChanges(
  vault: VaultConfig,
  changes: Array<RiskChange>,
  now: number
): VaultConfig | undefined {
  const newVault = cloneDeep(vault);
  let changed = false;

  for (const { key, value } of changes) {
    if (newVault.risks[key] !== value) {
      newVault.risks[key] = value;
      changed = true;
    }
  }

  if (!changed) {
    console.info(`[INFO] Vault ${vault.id} risks unchanged`);
    return undefined;
  }

  newVault.risks.updatedAt = now;
  return sortVaultKeys(newVault);
}

async function updateVaults(vaultsToUpdate: VaultConfig[], chainId: string) {
  const existingVaults = await getVaultsForChain(chainId);
  const vaultsToUpdateById = keyBy(vaultsToUpdate, 'id');
  const modified = existingVaults.map(oldVault => vaultsToUpdateById[oldVault.id] ?? oldVault);
  await saveJson(`./src/config/vault/${chainId}.json`, modified, 'prettier');
  console.info(`[INFO] ${vaultsToUpdate.length} vaults modified on chain ${chainId}`);
}

type GetVaultsOptions = {
  onlyChainId?: string;
  includeRelated?: boolean;
};

async function getVaultsByIds(
  vaultIds: string[],
  { onlyChainId, includeRelated = false }: GetVaultsOptions = {}
) {
  const existingVaultsByChainId = await getAllVaultConfigsByChainId();
  const res: typeof existingVaultsByChainId = {};

  if (onlyChainId && !existingVaultsByChainId[onlyChainId]) {
    throw new Error(`Chain ${onlyChainId} not found`);
  }

  const chainsToCheck = onlyChainId ? [onlyChainId] : Object.keys(existingVaultsByChainId);
  const remainingVaultIds = new Set(vaultIds);

  for (const chainId of chainsToCheck) {
    const chainVaults = existingVaultsByChainId[chainId];
    const filtered = chainVaults.filter(vault => remainingVaultIds.has(vault.id));
    if (filtered.length > 0) {
      filtered.forEach(vault => remainingVaultIds.delete(vault.id));
      res[chainId] =
        includeRelated ?
          uniqBy(
            filtered.flatMap(vault => getVaultWithRelated(vault, chainVaults)),
            'id'
          )
        : filtered;
    }
  }

  if (remainingVaultIds.size) {
    console.warn(`[WARN] ${remainingVaultIds.size} vaults not found`);
    console.debug('Missing vault ids:', Array.from(remainingVaultIds).join(', '));
  }

  return res;
}

function logRiskChanges(before: VaultRisksConfig, after: VaultRisksConfig) {
  for (const key of riskKeys) {
    if (before[key] !== after[key]) {
      console.log(`  - ${key}: ${before[key]} -> ${after[key]}`);
    }
  }
}

const getRiskNames = createFactory(async () => {
  const { default: strings } = await import('../src/locales/en/risks.json');
  return riskKeys.reduce(
    (acc, key) => {
      acc[key] = {
        passed: strings[`Checklist-${key}-passed-Title`] || key,
        failed: strings[`Checklist-${key}-failed-Title`] || key,
      };
      return acc;
    },
    {} as Record<RiskKeys, { passed: string; failed: string }>
  );
});

const getPlatformRisks = createFactory(async () => {
  const { default: platforms } = await import('../src/config/platforms.json');
  return new Map(
    platforms
      .filter(p => p.risks?.length)
      .map(platform => [platform.id, new Set(platform.risks || [])])
  );
});

const getTokenRisks = createCachedFactory(
  async (chainId: AddressBookChainId) => {
    const { addressBook } = await import('blockchain-addressbook');
    return new Map(
      Object.entries(addressBook[chainId].tokens)
        .filter(([_, t]) => t.risks?.length)
        .map(([id, token]) => [id, new Set<string>(token.risks || [])])
    );
  },
  chainId => chainId
);

async function getForcedRisksFor(vault: VaultConfig) {
  const [platformsRisks, chainTokenRisks] = await Promise.all([
    getPlatformRisks(),
    getTokenRisks(appToAddressBookId(vault.network)),
  ]);
  const forcedRisks = new Map<RiskKeys, { source: string; value: boolean }>();
  const platformRisks = vault.platformId ? platformsRisks.get(vault.platformId) : undefined;
  if (platformRisks) {
    for (const [riskKey, change] of Object.entries(platformRiskMap)) {
      if (platformRisks.has(riskKey)) {
        forcedRisks.set(change.key, {
          source: `platform ${vault.platformId}`,
          value: change.value,
        });
      }
    }
  }
  const tokenRisks =
    vault.assets?.length ?
      vault.assets
        .map(a => {
          const risks = chainTokenRisks.get(a);
          return risks ? { id: a, risks } : undefined;
        })
        .filter(isDefined)
    : undefined;
  if (tokenRisks) {
    for (const token of tokenRisks) {
      for (const [riskKey, change] of Object.entries(tokenRiskMap)) {
        if (token.risks.has(riskKey)) {
          forcedRisks.set(change.key, { source: `token ${token.id}`, value: change.value });
        }
      }
    }
  }

  return forcedRisks;
}

async function askForChangesViaUI(vault: VaultConfig) {
  const { checkbox, select } = await import('@inquirer/prompts');
  const riskNames = await getRiskNames();
  const forcedRisks = await getForcedRisksFor(vault);

  while (true) {
    const selected = new Set(
      await checkbox({
        message: `Select risks for ${vault.name} (${vault.id} on ${vault.network})`,
        required: false,
        loop: true,
        pageSize: riskKeys.length,
        choices: riskKeys.map((key, i) => {
          const forced = forcedRisks.get(key);
          const names = riskNames[key];
          const forcedName =
            forced ?
              ` [${i + 1}] ${forced.value ? names.failed : names.passed} {from ${forced.source}}`
            : undefined;

          return {
            value: key,
            short: key,
            name: forcedName ?? `[${i + 1}] ${names.passed}`,
            checkedName: forcedName ?? `[${i + 1}] ${names.failed}`,
            description: [
              forced ? `Forced to ${forced.value} by ${forced.source}` : undefined,
              `${key}: {false: "${names.passed}", true: "${names.failed}"}`,
            ]
              .filter(isDefined)
              .join('\n\n'),
            checked: forced?.value ?? vault.risks[key] === true,
            disabled: forced !== undefined,
          };
        }),
      })
    );
    const changes = riskKeys.reduce((acc, key) => {
      const value = selected.has(key) || forcedRisks.get(key)?.value === true;
      if (value !== vault.risks[key]) {
        acc.push({ key, value });
      }
      return acc;
    }, [] as Array<RiskChange>);
    if (changes.length > 0) {
      return changes;
    }

    const result = await select({
      message: 'No changes made. What do you want to do?',
      choices: [
        { value: 'skip' as const, name: 'Skip this vault' },
        { value: 'retry' as const, name: 'Retry risk selector' },
      ],
    });

    if (result === 'skip') {
      return undefined;
    }
  }
}

async function main() {
  const args = getRunArgs();
  if (args.help) {
    console.log(args);
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const vaultsToUpdate = await getVaultsByIds(args.vaults, {
    onlyChainId: args.chain,
    includeRelated: args.includeRelated,
  });
  const changes = riskKeys.reduce((acc, key) => {
    const value = args[key];
    if (typeof value === 'boolean') {
      acc.push({ key, value });
    }
    return acc;
  }, [] as Array<RiskChange>);
  const uiAvailable = args.ui && Object.keys(changes).length === 0 && process.stdin.isTTY;
  if (!Object.keys(changes).length && !uiAvailable) {
    console.log('No changes specified');
    return;
  }

  for (const chainId in vaultsToUpdate) {
    const modifiedVaults: VaultConfig[] = [];

    for (const vault of vaultsToUpdate[chainId]) {
      const vaultChanges = uiAvailable ? await askForChangesViaUI(vault) : changes;
      const newVault = vaultChanges ? applyChanges(vault, vaultChanges, timestamp) : undefined;
      if (newVault) {
        modifiedVaults.push(newVault);
        if (args.dryRun) {
          console.debug(`Changes for vault ${vault.id}:`);
          logRiskChanges(vault.risks, newVault.risks);
        }
      }
    }

    if (modifiedVaults.length === 0) {
      console.info(`[INFO] No vaults to modify on chain ${chainId}`);
      continue;
    }

    if (args.dryRun) {
      console.log(
        `[DRY RUN] ${chainId}: ${modifiedVaults.map(v => v.id).join(', ')} would be modified`
      );
      continue;
    }

    await updateVaults(modifiedVaults, chainId);
  }
}

main().catch(e => {
  // ctrl-c exit
  if (e instanceof Error && e.name === 'ExitPromptError') {
    process.exit(0);
    return;
  }

  console.error(e);
  process.exit(1);
});
