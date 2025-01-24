import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi, getConfigApi } from '../apis/instances';
import type { ChainEntity, ChainId } from '../entities/chain';
import type { PinnedConfig, PinnedConfigCondition, VaultConfig } from '../apis/config-types';
import { first, isEqual, keyBy, mapValues } from 'lodash-es';
import {
  type VaultBase,
  type VaultCowcentrated,
  type VaultCowcentratedBaseOnly,
  type VaultEntity,
  type VaultGov,
  type VaultGovBaseOnly,
  type VaultStandard,
  type VaultStandardBaseOnly,
  type VaultStatus,
} from '../entities/vault';
import { getVaultNames } from '../utils/vault-utils';
import { safetyScoreNum } from '../../../helpers/safetyScore';
import { isDefined } from '../utils/array-utils';
import { selectAllVisibleVaultIds, selectVaultsPinnedConfigs } from '../selectors/vaults';
import { selectVaultCurrentBoostId } from '../selectors/boosts';
import { selectVaultHasActiveOffchainCampaigns } from '../selectors/rewards';
import { getUnixNow } from '../../../helpers/date';
import { selectVaultTotalApy } from '../selectors/apy';

export interface FulfilledAllVaultsPayload {
  byChainId: {
    [chainId in ChainEntity['id']]?: { config: VaultConfig; entity: VaultEntity }[];
  };
}

export const fetchAllVaults = createAsyncThunk<
  FulfilledAllVaultsPayload,
  void,
  { state: BeefyState }
>('vaults/fetchAllVaults', async () => {
  const api = await getConfigApi();
  const vaultsByChainId = await api.fetchAllVaults();
  return {
    byChainId: mapValues(vaultsByChainId, (vaults, chainId) => {
      const entities = buildVaultEntitiesForChain(vaults, chainId as ChainId);
      return vaults.map((config, i) => ({
        config,
        entity: entities[i]!,
      }));
    }),
  };
});

type FulfilledVaultsLastHarvestPayload = {
  byVaultId: { [vaultId: VaultConfig['id']]: number };
};

export const fetchVaultsLastHarvests = createAsyncThunk<FulfilledVaultsLastHarvestPayload>(
  'vaults/last-harvest',
  async () => {
    const api = await getBeefyApi();
    const vaults = await api.getVaultLastHarvest();
    return { byVaultId: vaults };
  }
);

function buildVaultEntitiesForChain(configs: VaultConfig[], chainId: ChainId): VaultEntity[] {
  const { byId: cowcentratedBaseById, idToId: idToCowcentratedId } = getCowcentratedBases(configs);

  return configs.map(config => {
    const type: VaultEntity['type'] = config.type || 'standard';

    switch (type) {
      case 'standard':
        return getStandardVault(
          config,
          chainId,
          cowcentratedBaseById[idToCowcentratedId[config.id]]
        );
      case 'gov':
        return getGovVault(config, chainId, cowcentratedBaseById[idToCowcentratedId[config.id]]);
      case 'cowcentrated':
        return getCowcentratedVault(config, chainId, cowcentratedBaseById[config.id]);
      default:
        throw new Error(`Unknown vault type ${type}`);
    }
  });
}

function getStandardVault(
  config: VaultConfig,
  chainId: ChainEntity['id'],
  clmBase: VaultCowcentratedBaseOnly | undefined
): VaultStandard {
  const status = getVaultStatus(config);
  const base = getVaultBase(config, chainId);
  const standardBase: VaultStandardBaseOnly = {
    depositTokenAddress: config.tokenAddress || 'native',
    receiptTokenAddress: config.earnContractAddress,
    bridged: config.bridged || undefined,
    lendingOracle: config.lendingOracle || undefined,
  };

  if (clmBase) {
    return {
      ...base,
      ...status,
      ...standardBase,
      ...clmBase,
      type: 'standard',
      assetType: 'clm',
      name: base.names.short,
      names: {
        short: base.names.short,
        long: `${base.names.short} CLM Vault`,
        list: base.names.short,
        single: base.names.short,
        singleMeta: `${base.names.short} CLM Vault`,
      },
    };
  }

  return {
    ...base,
    ...status,
    ...standardBase,
    type: 'standard',
    subType: 'standard',
  };
}

function getGovVault(
  config: VaultConfig,
  chainId: ChainEntity['id'],
  clmBase: VaultCowcentratedBaseOnly | undefined
): VaultGov {
  const status = getVaultStatus(config);
  const base = getVaultBase(config, chainId);
  const govBase: VaultGovBaseOnly = {
    depositTokenAddress: config.tokenAddress || 'native',
    earnedTokenAddresses:
      config.earnedTokenAddresses ?? (config.earnedTokenAddress ? [config.earnedTokenAddress] : []),
  };

  if ((config.version || 1) >= 2) {
    if (clmBase) {
      return {
        ...base,
        ...status,
        ...govBase,
        ...clmBase,
        type: 'gov',
        contractType: 'multi',
        receiptTokenAddress: config.earnContractAddress,
        assetType: 'clm',
        excludedIds: [config.excluded, ...clmBase.cowcentratedIds.vaults].filter(isDefined),
        name: base.names.short,
        names: {
          short: base.names.short,
          long: `${base.names.short} CLM Pool`,
          list: base.names.short,
          single: base.names.short,
          singleMeta: `${base.names.short} CLM Pool`,
        },
      };
    }

    if (!govBase.earnedTokenAddresses.length) {
      throw new Error(`Gov vault ${config.id} must have at least 1 earned token address`);
    }

    return {
      ...base,
      ...status,
      ...govBase,
      type: 'gov',
      subType: 'gov',
      contractType: 'multi',
      receiptTokenAddress: config.earnContractAddress,
    };
  }

  if (!govBase.earnedTokenAddresses.length) {
    throw new Error(`Gov vault ${config.id} must have at least 1 earned token address`);
  }

  return {
    ...base,
    ...status,
    ...govBase,
    type: 'gov',
    subType: 'gov',
    contractType: 'single',
  };
}

function getCowcentratedVault(
  config: VaultConfig,
  chainId: ChainEntity['id'],
  clmBase: VaultCowcentratedBaseOnly | undefined
): VaultCowcentrated {
  if (!clmBase) {
    throw new Error(`Cowcentrated vault ${config.id} must have a CLM base`);
  }

  const status = getVaultStatus(config);
  const base = getVaultBase(config, chainId);
  return {
    ...base,
    ...status,
    ...clmBase,
    type: 'cowcentrated',
    subType: 'cowcentrated',
    receiptTokenAddress: config.earnContractAddress,
    depositTokenAddress: `${clmBase.poolAddress}-${config.id}`,
    excludedIds: [
      config.excluded,
      ...clmBase.cowcentratedIds.pools,
      ...clmBase.cowcentratedIds.vaults,
    ].filter(isDefined),
    assetType: 'clm',
    hidden: !!clmBase.cowcentratedIds.pools.length,
  };
}

function getCowcentratedBases(configs: VaultConfig[]) {
  const configByAddress = keyBy(configs, 'earnContractAddress');
  const byId: Record<string, VaultCowcentratedBaseOnly> = {};
  const idToId: Record<string, string> = {};

  const depositFor: Record<string, VaultConfig[]> = {};
  for (const config of configs) {
    const underlying = config.tokenAddress ? configByAddress[config.tokenAddress] : undefined;
    if (underlying && underlying.type === 'cowcentrated') {
      depositFor[underlying.id] ??= [];
      depositFor[underlying.id].push(config);
    }
  }

  for (const config of configs) {
    if (config.type === 'cowcentrated') {
      if (config.depositTokenAddresses?.length !== 2) {
        throw new Error(
          `Cowcentrated vault ${config.id} must have exactly 2 deposit token addresses (depositTokenAddresses)`
        );
      }
      if (!config.feeTier) {
        throw new Error(`Cowcentrated vault ${config.id} must have a fee tier (feeTier)`);
      }
      if (!config.tokenAddress) {
        throw new Error(
          `Cowcentrated vault ${config.id} must have underlying CL address (tokenAddress)`
        );
      }

      const govs = (depositFor[config.id] || [])
        .filter(c => c.type === 'gov')
        .sort((a, b) => b.createdAt - a.createdAt);
      const standards = (depositFor[config.id] || [])
        .filter(c => !c.type || c.type === 'standard')
        .sort((a, b) => b.createdAt - a.createdAt);
      const gov = first(govs.filter(c => c.status === 'active'));
      const standard = first(standards.filter(c => c.status === 'active'));

      byId[config.id] = {
        subType: 'cowcentrated',
        cowcentratedIds: {
          clm: config.id,
          pool: gov?.id,
          vault: standard?.id,
          pools: govs.map(v => v.id),
          vaults: standards.map(v => v.id),
        },
        depositTokenAddresses: config.depositTokenAddresses,
        feeTier: config.feeTier,
        poolAddress: config.tokenAddress,
        risks: config.risks || [],
        safetyScore: safetyScoreNum(config.risks || []) || 0,
      };

      for (const c of govs) {
        idToId[c.id] = config.id;
      }
      for (const c of standards) {
        idToId[c.id] = config.id;
      }
    }
  }

  return { byId, idToId };
}

function getVaultStatus(apiVault: VaultConfig): VaultStatus {
  return apiVault.status === 'active'
    ? { status: 'active' }
    : apiVault.status === 'eol'
    ? {
        status: 'eol',
        retireReason: apiVault.retireReason || 'default',
        retiredAt: apiVault.retiredAt || 0,
      }
    : {
        status: 'paused',
        pauseReason: apiVault.pauseReason || 'default',
        pausedAt: apiVault.pausedAt || 0,
      };
}

function getVaultBase(config: VaultConfig, chainId: ChainEntity['id']): VaultBase {
  const names = getVaultNames(config.name, config.type);

  return {
    id: config.id,
    name: config.id === 'bifi-vault' ? names.long : config.name,
    names,
    version: config.version || 1,
    chainId: chainId,
    contractAddress: config.earnContractAddress,
    assetIds: config.assets || [],
    createdAt: config.createdAt || 0,
    updatedAt: config.updatedAt || config.createdAt || 0,
    zaps: config.zaps || [],
    excludedIds: config.excluded ? [config.excluded] : [],
    buyTokenUrl: config.buyTokenUrl || undefined,
    addLiquidityUrl: config.addLiquidityUrl || undefined,
    removeLiquidityUrl: config.removeLiquidityUrl || undefined,
    assetType: config.assets?.length === 1 ? 'single' : 'lps',
    earningPoints: (config.pointStructureIds || []).length > 0,
    pointStructureIds: config.pointStructureIds || [],
    platformId: config.platformId,
    strategyTypeId: config.strategyTypeId,
    risks: config.risks || [],
    safetyScore: safetyScoreNum(config.risks || []) || 0,
    depositFee: config.depositFee || 0,
    migrationIds: config.migrationIds || [],
    hidden: false,
    poolTogether: config.poolTogether,
    breakdownId: config.oracle === 'tokens' ? config.id : config.oracleId, // use vault id when deposit token is not a LP
  };
}

type FulfilledVaultsPinnedConfigPayload = {
  configs: PinnedConfig[];
};

export const fetchVaultsPinnedConfig = createAsyncThunk<FulfilledVaultsPinnedConfigPayload>(
  'vaults/pinned-config',
  async () => {
    const api = await getConfigApi();
    const configs = await api.fetchPinnedConfig();
    return { configs };
  }
);

type FulfilledVaultsPinnedPayload = {
  byId: { [vaultId: VaultConfig['id']]: boolean };
};

function selectVaultMatchesCondition(
  state: BeefyState,
  vaultId: string,
  condition: PinnedConfigCondition
) {
  switch (condition.type) {
    case 'boosted': {
      const apy = selectVaultTotalApy(state, vaultId);
      if (!!apy && (apy.boostedTotalDaily || 0) > 0) {
        if (!condition.only) {
          // default: no further checks
          return true;
        } else if (condition.only === 'contract') {
          // only if boosted via traditional boost contract/config
          const boostId = selectVaultCurrentBoostId(state, vaultId);
          if (boostId) {
            return true;
          }
        } else if (condition.only === 'offchain') {
          // only if there is an offchain campaign (e.g. merkl)
          const hasOffchainCampaign = selectVaultHasActiveOffchainCampaigns(state, vaultId);
          if (hasOffchainCampaign) {
            return true;
          }
        }
      }
      return false;
    }
    case 'until': {
      return getUnixNow() <= condition.timestamp;
    }
    default: {
      // @ts-expect-error when all cases are covered
      throw new Error(`Unknown pinned condition type ${condition.type}`);
    }
  }
}

function selectVaultMatchesAllConditions(
  state: BeefyState,
  vaultId: string,
  conditions: PinnedConfigCondition[]
) {
  return conditions.every(condition => selectVaultMatchesCondition(state, vaultId, condition));
}

function selectVaultMatchesAnyCondition(
  state: BeefyState,
  vaultId: string,
  conditions: PinnedConfigCondition[]
) {
  return conditions.some(condition => selectVaultMatchesCondition(state, vaultId, condition));
}

export const vaultsRecalculatePinned = createAsyncThunk<
  FulfilledVaultsPinnedPayload,
  void,
  { state: BeefyState }
>('vaults/recalculate-pinned', async (_, { getState }) => {
  const state = getState();
  const configs = selectVaultsPinnedConfigs(state);
  const byId: Record<string, boolean> = {};
  const allVaultIds = selectAllVisibleVaultIds(state);

  for (const config of configs) {
    const ids = config.id
      ? (Array.isArray(config.id) ? config.id : [config.id]).filter(id => allVaultIds.includes(id))
      : allVaultIds;
    if (!ids.length) {
      console.warn(`No active vaults found for pinned config`, config);
      continue;
    }

    const mode = config.mode || 'all';

    for (const id of ids) {
      // already pinned by another condition
      if (byId[id]) {
        continue;
      }
      // condition-less pin
      if (!config.conditions) {
        byId[id] = true;
        continue;
      }
      // pin if all/any conditions are met
      if (
        (mode === 'all' && selectVaultMatchesAllConditions(state, id, config.conditions)) ||
        (mode === 'any' && selectVaultMatchesAnyCondition(state, id, config.conditions))
      ) {
        byId[id] = true;
      }
    }
  }

  // return same object if nothing changed
  const existingById = state.entities.vaults.pinned.byId;
  return { byId: isEqual(existingById, byId) ? existingById : byId };
});
