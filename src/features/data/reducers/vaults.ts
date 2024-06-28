import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import type { Draft } from 'immer';
import { sortBy } from 'lodash-es';
import { safetyScoreNum } from '../../../helpers/safetyScore';
import type { BeefyState } from '../../../redux-types';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import { fetchAllVaults, fetchVaultsLastHarvests } from '../actions/vaults';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import type { ChainEntity } from '../entities/chain';
import {
  isCowcentratedVault,
  isGovVault,
  isStandardVault,
  type VaultBase,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
  type VaultStatus,
} from '../entities/vault';
import type { NormalizedEntity } from '../utils/normalized-entity';
import type { VaultConfig } from '../apis/config-types';
import { entries, fromKeysBy, pushOrSet } from '../../../helpers/object';
import { BIG_ZERO } from '../../../helpers/big-number';
import { getVaultNames } from '../utils/vault-utils';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  /** All chains that have at least 1 vault */
  allChainIds: ChainEntity['id'][];
  /** Vaults that have status: active */
  allActiveIds: VaultEntity['id'][];
  /** Vaults that have bridged receipt tokens we should track */
  allBridgedIds: VaultEntity['id'][];
  /** Relations between vaults */
  relations: {
    /** which vault does vaultId use as its deposit token  */
    underlyingOf: {
      byId: {
        [vaultId: VaultEntity['id']]: VaultEntity['id'];
      };
      byType: {
        /** type of the underlying vault (right hand side) */
        [type in VaultEntity['type']]: {
          byId: {
            [vaultId: VaultEntity['id']]: VaultEntity['id'];
          };
        };
      };
    };
    /** which vaults is vaultId the deposit token for  */
    depositFor: {
      byId: {
        [vaultId: VaultEntity['id']]: VaultEntity['id'][];
      };
      byType: {
        /** type of the parent vault (right hand side) */
        [type in VaultEntity['type']]: {
          byId: {
            [vaultId: VaultEntity['id']]: VaultEntity['id'][];
          };
        };
      };
    };
  };
  /** Vaults id look up by chain id */
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      /** Vaults on chain */
      allIds: VaultEntity['id'][];
      /** Vaults by their contract address */
      byAddress: {
        [address: string]: VaultEntity['id'];
      };
      byType: {
        [type in VaultEntity['type']]: {
          /** Vaults on chain of type */
          allIds: VaultEntity['id'][];
          /** Find {type} vaults by contract address (earnContractAddress) */
          byAddress: {
            [address: string]: VaultEntity['id'];
          };
          /** Find {type} vaults by deposit token address */
          byDepositTokenAddress: {
            [address: string]: VaultEntity['id'][];
          };
        };
      };
    };
  };

  /**
   * pricePerFullShare is how you find out how much your mooTokens
   * (shares) represent in term of the underlying asset
   *
   * So if you deposit 1 BIFI you will get, for example 0.95 mooBIFI,
   * with a ppfs of X, if you multiply your mooBIIFI * ppfs you get your amount in BIFI
   *
   * That value is fetched from the smart contract upon loading
   **/
  contractData: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: {
        strategyAddress: string;
        pricePerFullShare?: BigNumber | null;
        balances?: BigNumber[];
      };
    };
  };

  lastHarvestById: {
    [vaultId: VaultEntity['id']]: number;
  };
};

export const initialVaultsState: VaultsState = {
  byId: {},
  allIds: [],
  allActiveIds: [],
  allBridgedIds: [],
  allChainIds: [],
  relations: {
    underlyingOf: {
      byId: {},
      byType: {
        standard: {
          byId: {},
        },
        gov: {
          byId: {},
        },
        cowcentrated: {
          byId: {},
        },
      },
    },
    depositFor: {
      byId: {},
      byType: {
        standard: {
          byId: {},
        },
        gov: {
          byId: {},
        },
        cowcentrated: {
          byId: {},
        },
      },
    },
  },
  byChainId: {},
  contractData: { byVaultId: {} },
  lastHarvestById: {},
};

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialVaultsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      let added = false;

      for (const [chainId, vaults] of entries(action.payload.byChainId)) {
        if (vaults) {
          for (const vault of vaults) {
            if (!sliceState.byId[vault.id]) {
              added = true;
              sliceState.byId[vault.id] = getVaultEntityFromConfig(
                action.payload.state,
                chainId,
                vault
              );
            }
          }
        }
      }

      // If new vaults were added
      if (added) {
        rebuildVaultsState(sliceState);
      }
    });

    builder.addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
      addContractDataToState(sliceState, action.payload.data);
    });

    builder.addCase(fetchVaultsLastHarvests.fulfilled, (sliceState, action) => {
      for (const [vaultId, lastHarvest] of Object.entries(action.payload.byVaultId)) {
        // time in milliseconds since unix epoch
        sliceState.lastHarvestById[vaultId] = lastHarvest * 1000;
      }
    });

    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        addContractDataToState(sliceState, action.payload.contractData);
      }
    );
  },
});

function addContractDataToState(
  sliceState: Draft<VaultsState>,
  contractData: FetchAllContractDataResult
) {
  for (const vaultContractData of contractData.standardVaults) {
    const vaultId = vaultContractData.id;

    // only update it if needed
    if (sliceState.contractData.byVaultId[vaultId] === undefined) {
      sliceState.contractData.byVaultId[vaultId] = {
        pricePerFullShare: vaultContractData.pricePerFullShare,
        strategyAddress: vaultContractData.strategy,
      };
    }

    if (
      !sliceState.contractData.byVaultId[vaultId].pricePerFullShare?.isEqualTo(
        vaultContractData.pricePerFullShare
      )
    ) {
      sliceState.contractData.byVaultId[vaultId].pricePerFullShare =
        vaultContractData.pricePerFullShare;
    }

    if (sliceState.contractData.byVaultId[vaultId].strategyAddress !== vaultContractData.strategy) {
      sliceState.contractData.byVaultId[vaultId].strategyAddress = vaultContractData.strategy;
    }
  }

  for (const cowVaultContractData of contractData.cowVaults) {
    const vaultId = cowVaultContractData.id;

    if (sliceState.contractData.byVaultId[vaultId] === undefined) {
      sliceState.contractData.byVaultId[vaultId] = {
        balances: [BIG_ZERO, BIG_ZERO],
        strategyAddress: cowVaultContractData.strategy,
      };
    }

    if (
      !sliceState.contractData.byVaultId[vaultId].balances!.every((balance, index) => {
        return balance.isEqualTo(cowVaultContractData.balances[index]);
      })
    ) {
      sliceState.contractData.byVaultId[vaultId].balances = cowVaultContractData.balances;
    }

    if (
      sliceState.contractData.byVaultId[vaultId].strategyAddress !== cowVaultContractData.strategy
    ) {
      sliceState.contractData.byVaultId[vaultId].strategyAddress = cowVaultContractData.strategy;
    }
  }
}

function createVaultsChainState(): VaultsState['byChainId'][ChainEntity['id']] {
  return {
    allIds: [],
    byAddress: {},
    byType: {
      standard: {
        allIds: [],
        byAddress: {},
        byDepositTokenAddress: {},
      },
      gov: {
        allIds: [],
        byAddress: {},
        byDepositTokenAddress: {},
      },
      cowcentrated: {
        allIds: [],
        byAddress: {},
        byDepositTokenAddress: {},
      },
    },
  };
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

function getVaultBase(apiVault: VaultConfig, chainId: ChainEntity['id']): VaultBase {
  const names = getVaultNames(apiVault.name, apiVault.type);
  if (apiVault.id === 'bifi-vault') {
    names.name = names.longName;
  }

  return {
    id: apiVault.id,
    version: apiVault.version || 1,
    chainId: chainId,
    contractAddress: apiVault.earnContractAddress,
    assetIds: apiVault.assets || [],
    createdAt: apiVault.createdAt || 0,
    updatedAt: apiVault.updatedAt || apiVault.createdAt || 0,
    zaps: apiVault.zaps || [],
    excludedId: apiVault.excluded || undefined,
    ...names,
  };
}

function getVaultEntityFromConfig(
  state: BeefyState,
  chainId: ChainEntity['id'],
  apiVault: VaultConfig
): VaultEntity {
  let vault: VaultEntity;
  const vaultStatus: VaultStatus = getVaultStatus(apiVault);
  const vaultBase: VaultBase = getVaultBase(apiVault, chainId);
  const score = getVaultSafetyScore(apiVault);

  if (apiVault.type === 'gov') {
    vault = {
      type: 'gov',
      subType: apiVault.earnedTokenAddresses ? 'multi' : 'single',
      depositTokenAddress: apiVault.tokenAddress || 'native',
      earnedTokenAddresses: apiVault.earnedTokenAddresses ?? [apiVault.earnedTokenAddress!],
      strategyTypeId: apiVault.strategyTypeId,
      platformId: apiVault.platformId,
      safetyScore: score,
      assetType: 'single',
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: apiVault.earnedTokenAddresses ? apiVault.addLiquidityUrl ?? null : null,
      removeLiquidityUrl: null,
      depositFee: apiVault.depositFee ?? 0,
      ...vaultBase,
      ...vaultStatus,
    } satisfies VaultGov;
  } else if (apiVault.type === 'cowcentrated') {
    vault = {
      type: 'cowcentrated',
      depositTokenAddress: apiVault.tokenAddress
        ? apiVault.tokenAddress + '-' + apiVault.id
        : 'native',
      depositTokenAddresses: apiVault.depositTokenAddresses || [],
      earnedTokenAddress: apiVault.earnedTokenAddress!,
      strategyTypeId: apiVault.strategyTypeId,
      platformId: apiVault.platformId,
      assetType: 'lps',
      safetyScore: score,
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: apiVault.addLiquidityUrl || null,
      removeLiquidityUrl: apiVault.removeLiquidityUrl || null,
      depositFee: apiVault.depositFee ?? 0,
      migrationIds: apiVault.migrationIds,
      bridged: apiVault.bridged,
      lendingOracle: apiVault.lendingOracle,
      earningPoints: apiVault.earningPoints ?? false,
      feeTier: apiVault.feeTier ?? '0.05',
      ...vaultBase,
      ...vaultStatus,
    } satisfies VaultCowcentrated;
  } else if (apiVault.type === 'standard' || apiVault.type === undefined) {
    vault = {
      type: apiVault.type || 'standard',
      depositTokenAddress: apiVault.tokenAddress ?? 'native',
      earnedTokenAddress: apiVault.earnedTokenAddress!,
      strategyTypeId: apiVault.strategyTypeId,
      platformId: apiVault.platformId,
      assetType: !apiVault.assets ? 'single' : apiVault.assets.length > 1 ? 'lps' : 'single',
      safetyScore: score,
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: apiVault.addLiquidityUrl || null,
      removeLiquidityUrl: apiVault.removeLiquidityUrl || null,
      depositFee: apiVault.depositFee ?? 0,
      migrationIds: apiVault.migrationIds,
      bridged: apiVault.bridged,
      lendingOracle: apiVault.lendingOracle,
      earningPoints: apiVault.earningPoints ?? false,
      ...vaultBase,
      ...vaultStatus,
    } satisfies VaultStandard;
  } else {
    throw new Error(`Unknown vault type: ${apiVault.type}`);
  }

  return vault;
}

function rebuildVaultsState(sliceState: Draft<VaultsState>) {
  const allIds = sortBy(Object.keys(sliceState.byId), id => {
    return -sliceState.byId[id]!.updatedAt;
  });
  const allVaults = allIds.map(id => sliceState.byId[id]!);
  const allChainIds = Array.from(
    allVaults
      .reduce((acc, vault) => {
        acc.add(vault.chainId);
        return acc;
      }, new Set<ChainEntity['id']>())
      .values()
  );

  const allActiveIds: VaultsState['allActiveIds'] = [];
  const allBridgedIds: VaultsState['allBridgedIds'] = [];
  const byChainId: VaultsState['byChainId'] = fromKeysBy(allChainIds, () =>
    createVaultsChainState()
  );

  for (const vault of allVaults) {
    // global
    if (vault.status === 'active') {
      allActiveIds.push(vault.id);
    }
    if ((isStandardVault(vault) || isCowcentratedVault(vault)) && !!vault.bridged) {
      allBridgedIds.push(vault.id);
    }

    // by chain
    const chainState = byChainId[vault.chainId]!;
    chainState.allIds.push(vault.id);
    chainState.byAddress[vault.contractAddress.toLowerCase()] = vault.id;

    // by vault type by chain
    const chainTypeState = chainState.byType[vault.type];
    chainTypeState.allIds.push(vault.id);
    chainTypeState.byAddress[vault.contractAddress.toLowerCase()] = vault.id;
    pushOrSet(
      chainTypeState.byDepositTokenAddress,
      vault.depositTokenAddress.toLowerCase(),
      vault.id
    );
  }

  // Update state
  sliceState.allIds = allIds;
  sliceState.allChainIds = allChainIds;
  sliceState.allActiveIds = allActiveIds;
  sliceState.allBridgedIds = allBridgedIds;
  sliceState.byChainId = byChainId;
  sliceState.relations = getVaultRelations(sliceState);

  // TODO think of a better way to do this
  //  - we need the vault relations resolved in order tell if the reward pool is for a clm or not
  for (const vault of allVaults) {
    if (isStandardVault(vault)) {
      const underlyingGovId = sliceState.relations.underlyingOf.byType.gov.byId[vault.id];
      if (underlyingGovId) {
        const underlyingGov = sliceState.byId[underlyingGovId]!;
        underlyingGov.excludedId = vault.id; // gov excludes standard tvl
      }
    } else if (isGovVault(vault)) {
      const underlyingClmId = sliceState.relations.underlyingOf.byType.cowcentrated.byId[vault.id];
      if (underlyingClmId) {
        const underlyingClm = sliceState.byId[underlyingClmId]!;
        vault.name = vault.shortName;
        vault.longName = vault.shortName;
        vault.risks = underlyingClm?.risks || [];
        underlyingClm.excludedId = vault.id; // clm excludes gov tvl
      }
    }
  }
}

function getVaultRelations(sliceState: Draft<VaultsState>): VaultsState['relations'] {
  const underlyingOf: VaultsState['relations']['underlyingOf']['byId'] = {};
  const underlyingOfByType: VaultsState['relations']['underlyingOf']['byType'] = {
    standard: { byId: {} },
    gov: { byId: {} },
    cowcentrated: { byId: {} },
  };
  const depositForById: VaultsState['relations']['depositFor']['byId'] = {};
  const depositForByType: VaultsState['relations']['depositFor']['byType'] = {
    standard: { byId: {} },
    gov: { byId: {} },
    cowcentrated: { byId: {} },
  };

  for (const chainSlice of Object.values(sliceState.byChainId)) {
    for (const vaultId of chainSlice.allIds) {
      const vault = sliceState.byId[vaultId];
      if (!vault) {
        continue;
      }
      const underlyingVaultId = chainSlice.byAddress[vault.depositTokenAddress.toLowerCase()];
      if (!underlyingVaultId) {
        continue;
      }
      const underlyingVault = sliceState.byId[underlyingVaultId];
      if (!underlyingVault) {
        continue;
      }

      // vaultId uses underlyingVaultId as its deposit token
      underlyingOf[vaultId] = underlyingVaultId;

      // vaultId uses underlyingVaultId of type underlyingVault.type as its deposit token
      underlyingOfByType[underlyingVault.type].byId[vaultId] = underlyingVaultId;

      // underlyingVaultId is the deposit token for vaultId
      pushOrSet(depositForById, underlyingVaultId, vaultId);

      // underlyingVaultId is the deposit token for vaultId of type vault.type
      pushOrSet(depositForByType[vault.type].byId, underlyingVaultId, vaultId);
    }
  }

  return {
    underlyingOf: {
      byId: underlyingOf,
      byType: underlyingOfByType,
    },
    depositFor: {
      byId: depositForById,
      byType: depositForByType,
    },
  };
}

function getVaultSafetyScore(apiVault: VaultConfig): number {
  if (apiVault.risks && apiVault.risks.length > 0) {
    return safetyScoreNum(apiVault.risks) || 0;
  }

  return 0;
}
