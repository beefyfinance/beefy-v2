import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import type { Draft } from 'immer';
import { isEmpty, mapValues, sortBy } from 'lodash-es';
import { safetyScoreNum } from '../../../helpers/safetyScore';
import type { BeefyState } from '../../../redux-types';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import {
  fetchAllVaults,
  fetchFeaturedVaults,
  fetchVaultsZapSupport,
  fetchVaultsLastHarvests,
} from '../actions/vaults';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import type { NormalizedEntity } from '../utils/normalized-entity';
import type { FeaturedVaultConfig, VaultConfig } from '../apis/config-types';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  /** Vaults that have bridged receipt tokens we should track */
  allBridgedIds: VaultEntity['id'][];

  byChainId: {
    [chainId: ChainEntity['id']]: {
      /** Vaults that have status: active */
      allActiveIds: VaultEntity['id'][];
      /** Vaults that have status: eol or paused */
      allRetiredIds: VaultEntity['id'][];
      /** Vaults that have bridged receipt tokens we should track */
      allBridgedIds: VaultEntity['id'][];
      /** Find standard vaults by deposit token address or earned token address */
      standardVault: {
        /** Map of standard vault ids by deposit token address */
        byDepositTokenAddress: {
          [address: string]: VaultEntity['id'][];
        };
        /** Map of standard vault id by earned (receipt) token address */
        byEarnedTokenAddress: {
          [address: string]: VaultEntity['id'];
        };
      };
      /** Find gov vaults by deposit token address */
      govVault: {
        /** Map of gov vault ids by deposit token address */
        byDepositTokenAddress: {
          [address: string]: VaultEntity['id'][];
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
        pricePerFullShare: BigNumber;
      };
    };
  };

  /**
   * We want to know if the vault is featured or not
   */
  featuredVaults: FeaturedVaultConfig;

  /**
   * Which zaps are enabled for each vault
   */
  zapSupportById: {
    [vaultId: VaultEntity['id']]: {
      beefy: boolean;
      oneInch: boolean;
    };
  };

  lastHarvestById: {
    [vaultId: VaultEntity['id']]: number;
  };
};
export const initialVaultsState: VaultsState = {
  byId: {},
  allIds: [],
  allBridgedIds: [],
  byChainId: {},
  contractData: { byVaultId: {} },
  featuredVaults: {},
  zapSupportById: {},
  lastHarvestById: {},
};

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialVaultsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchFeaturedVaults.fulfilled, (sliceState, action) => {
      sliceState.featuredVaults = action.payload.byVaultId;
    });

    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      const initialVaultAmount = sliceState.allIds.length;
      for (const [chainId, vaults] of Object.entries(action.payload.byChainId)) {
        for (const vault of vaults) {
          addVaultToState(action.payload.state, sliceState, chainId, vault);
        }
      }

      // If new vaults were added, apply default sorting
      if (sliceState.allIds.length !== initialVaultAmount) {
        sliceState.allIds = sortBy(sliceState.allIds, id => {
          return -sliceState.byId[id].createdAt;
        });
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

    builder.addCase(fetchVaultsZapSupport.fulfilled, (sliceState, action) => {
      sliceState.zapSupportById = mapValues(action.payload.byVaultId, support => {
        return {
          beefy: support.includes('beefy'),
          oneInch: support.includes('oneInch'),
        };
      });
    });
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
      !sliceState.contractData.byVaultId[vaultId].pricePerFullShare.isEqualTo(
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
}

function addVaultToState(
  state: BeefyState,
  sliceState: Draft<VaultsState>,
  chainId: ChainEntity['id'],
  apiVault: VaultConfig
) {
  // we already know this vault
  if (apiVault.id in sliceState.byId) {
    return;
  }
  const score = getVaultSafetyScore(state, chainId, apiVault);

  if (apiVault.isGovVault) {
    const vault: VaultGov = {
      id: apiVault.id,
      name: apiVault.name,
      isGovVault: true,
      depositTokenAddress: apiVault.tokenAddress,
      earnedTokenAddress: apiVault.earnedTokenAddress,
      earnContractAddress: apiVault.earnContractAddress,
      strategyTypeId: apiVault.strategyTypeId,
      excludedId: apiVault.excluded || null,
      chainId: chainId,
      status: apiVault.status as VaultGov['status'],
      platformId: apiVault.platformId,
      safetyScore: score,
      assetIds: apiVault.assets || [],
      type: 'single',
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: null,
      removeLiquidityUrl: null,
      depositFee: apiVault.depositFee ?? '0%',
      createdAt: apiVault.createdAt ?? 0,
      retireReason: apiVault.retireReason,
      pauseReason: apiVault.pauseReason,
    };

    sliceState.byId[vault.id] = vault;
    sliceState.allIds.push(vault.id);
    if (sliceState.byChainId[vault.chainId] === undefined) {
      sliceState.byChainId[vault.chainId] = {
        allActiveIds: [],
        allRetiredIds: [],
        allBridgedIds: [],
        standardVault: {
          byEarnedTokenAddress: {},
          byDepositTokenAddress: {},
        },
        govVault: {
          byDepositTokenAddress: {},
        },
      };
    }

    const vaultState = sliceState.byChainId[vault.chainId];
    if (apiVault.status === 'eol' || apiVault.status === 'paused') {
      vaultState.allRetiredIds.push(vault.id);
    } else {
      vaultState.allActiveIds.push(vault.id);
    }

    if (!vaultState.govVault.byDepositTokenAddress[vault.depositTokenAddress.toLowerCase()]) {
      vaultState.govVault.byDepositTokenAddress[vault.depositTokenAddress.toLowerCase()] = [];
    }
    vaultState.govVault.byDepositTokenAddress[vault.depositTokenAddress.toLowerCase()].push(
      vault.id
    );
  } else {
    const vault: VaultStandard = {
      id: apiVault.id,
      name: apiVault.name,
      isGovVault: false,
      depositTokenAddress: apiVault.tokenAddress ?? 'native',
      earnContractAddress: apiVault.earnContractAddress,
      earnedTokenAddress: apiVault.earnedTokenAddress,
      strategyTypeId: apiVault.strategyTypeId,
      chainId: chainId,
      platformId: apiVault.platformId,
      status: apiVault.status as VaultStandard['status'],
      type: !apiVault.assets ? 'single' : apiVault.assets.length > 1 ? 'lps' : 'single',
      safetyScore: score,
      assetIds: apiVault.assets || [],
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: apiVault.addLiquidityUrl || null,
      removeLiquidityUrl: apiVault.removeLiquidityUrl || null,
      depositFee: apiVault.depositFee ?? '0%',
      createdAt: apiVault.createdAt ?? 0,
      retireReason: apiVault.retireReason,
      pauseReason: apiVault.pauseReason,
      migrationIds: apiVault.migrationIds,
      bridged: apiVault.bridged,
    };
    // redux toolkit uses immer by default so we can
    // directly modify the state as usual
    sliceState.byId[vault.id] = vault;
    sliceState.allIds.push(vault.id);
    if (sliceState.byChainId[vault.chainId] === undefined) {
      sliceState.byChainId[vault.chainId] = {
        allActiveIds: [],
        allRetiredIds: [],
        allBridgedIds: [],
        standardVault: {
          byEarnedTokenAddress: {},
          byDepositTokenAddress: {},
        },
        govVault: {
          byDepositTokenAddress: {},
        },
      };
    }
    const vaultState = sliceState.byChainId[vault.chainId];
    if (apiVault.status === 'eol' || apiVault.status === 'paused') {
      vaultState.allRetiredIds.push(vault.id);
    } else {
      vaultState.allActiveIds.push(vault.id);
    }

    if (vault.bridged) {
      vaultState.allBridgedIds.push(vault.id);
      sliceState.allBridgedIds.push(vault.id);
    }

    if (!vaultState.standardVault.byDepositTokenAddress[vault.depositTokenAddress.toLowerCase()]) {
      vaultState.standardVault.byDepositTokenAddress[vault.depositTokenAddress.toLowerCase()] = [];
    }
    vaultState.standardVault.byDepositTokenAddress[vault.depositTokenAddress.toLowerCase()].push(
      vault.id
    );
    vaultState.standardVault.byEarnedTokenAddress[vault.earnedTokenAddress.toLowerCase()] =
      vault.id;
  }
}

function getVaultSafetyScore(
  state: BeefyState,
  chainId: ChainEntity['id'],
  apiVault: VaultConfig
): number {
  let score = 0;
  if (!isEmpty(apiVault.risks)) {
    score = safetyScoreNum(apiVault.risks);
  }

  return score;
}
