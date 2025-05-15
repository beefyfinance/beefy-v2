import { first, keyBy, mapValues, partition } from 'lodash-es';
import { SCORED_RISKS } from '../../../config/risk.ts';
import { safetyScoreNum } from '../../../helpers/safetyScore.ts';
import type { VaultConfig } from '../apis/config-types.ts';
import { getBeefyApi, getConfigApi } from '../apis/instances.ts';
import type { ChainEntity, ChainId } from '../entities/chain.ts';
import {
  type VaultBase,
  type VaultCowcentrated,
  type VaultCowcentratedBaseOnly,
  type VaultEntity,
  type VaultErc4626,
  type VaultErc4626BaseOnly,
  type VaultGov,
  type VaultGovBaseOnly,
  type VaultStandard,
  type VaultStandardBaseOnly,
  type VaultStatus,
} from '../entities/vault.ts';
import { isDefined } from '../utils/array-utils.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { getVaultNames } from '../utils/vault-utils.ts';

export interface FulfilledAllVaultsPayload {
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      config: VaultConfig;
      entity: VaultEntity;
    }[];
  };
}

export const fetchAllVaults = createAppAsyncThunk<FulfilledAllVaultsPayload>(
  'vaults/fetchAllVaults',
  async () => {
    const api = await getConfigApi();
    const vaultsByChainId = await api.fetchAllVaults();
    return {
      byChainId: mapValues(vaultsByChainId, (vaults, chainId) => {
        const entities = buildVaultEntitiesForChain(vaults, chainId as ChainId);
        return vaults.map((config, i) => ({
          config,
          entity: entities[i],
        }));
      }),
    };
  }
);

type FulfilledVaultsLastHarvestPayload = {
  byVaultId: {
    [vaultId: VaultConfig['id']]: number;
  };
};

export const fetchVaultsLastHarvests = createAppAsyncThunk<FulfilledVaultsLastHarvestPayload>(
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
      case 'erc4626':
        return getErc4626Vault(config, chainId, cowcentratedBaseById[config.id]);
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

function getErc4626Vault(
  config: VaultConfig,
  chainId: ChainEntity['id'],
  clmBase: VaultCowcentratedBaseOnly | undefined
): VaultErc4626 {
  const status = getVaultStatus(config);
  const base = getVaultBase(config, chainId);
  const erc4626Base: VaultErc4626BaseOnly = {
    depositTokenAddress: config.tokenAddress || 'native',
    receiptTokenAddress: config.earnContractAddress,
  };

  if (clmBase) {
    throw new Error(`Erc4626 vault ${config.id} must not have a CLM base`);
  }

  const subType = config.subType || 'standard';
  if (!isValidErc4626SubType(subType)) {
    throw new Error(`Erc4626 vault ${config.id} must have valid subType`);
  }

  return {
    ...base,
    ...status,
    ...erc4626Base,
    type: 'erc4626',
    subType,
  };
}

function isValidErc4626SubType(subType: string | undefined): subType is VaultErc4626['subType'] {
  return subType === 'erc7540:withdraw';
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
  return (
    apiVault.status === 'active' ? { status: 'active' }
    : apiVault.status === 'eol' ?
      {
        status: 'eol',
        retireReason: apiVault.retireReason || 'default',
        retiredAt: apiVault.retiredAt || 0,
      }
    : {
        status: 'paused',
        pauseReason: apiVault.pauseReason || 'default',
        pausedAt: apiVault.pausedAt || 0,
      }
  );
}

function getVaultRisks(apiVault: VaultConfig): string[] {
  const risks = apiVault.risks || [];
  const [validRisks, invalidrisks] = partition(risks, risk => risk in SCORED_RISKS);

  if (invalidrisks.length > 0) {
    console.warn(`Invalid risks found for vault ${apiVault.id}: ${invalidrisks.join(', ')}`);
  }

  return validRisks;
}

function getVaultBase(config: VaultConfig, chainId: ChainEntity['id']): VaultBase {
  const names = getVaultNames(config.name, config.type);
  const risks = getVaultRisks(config);

  return {
    id: config.id,
    name: config.id === 'bifi-vault' ? names.long : config.name,
    names,
    icons: config.icons,
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
    risks,
    safetyScore: safetyScoreNum(risks) || 0,
    depositFee: config.depositFee || 0,
    migrationIds: config.migrationIds || [],
    hidden: false,
    poolTogether: config.poolTogether,
    breakdownId: config.oracle === 'tokens' ? config.id : config.oracleId, // use vault id when deposit token is not a LP
  };
}
