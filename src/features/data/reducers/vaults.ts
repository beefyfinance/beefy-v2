import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import type { Draft } from 'immer';
import { sortBy } from 'lodash-es';
import { safetyScoreNum } from '../../../helpers/safetyScore';
import type { BeefyState } from '../../../redux-types';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import { fetchAllVaults, fetchFeaturedVaults, fetchVaultsLastHarvests } from '../actions/vaults';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import type { ChainEntity } from '../entities/chain';
import {
  isCowcentratedLiquidityVault,
  isGovVault,
  isStandardVault,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
} from '../entities/vault';
import type { NormalizedEntity } from '../utils/normalized-entity';
import type { FeaturedVaultConfig, VaultConfig } from '../apis/config-types';
import { entries } from '../../../helpers/object';
import { BIG_ZERO } from '../../../helpers/big-number';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  /** Vaults that have bridged receipt tokens we should track */
  allBridgedIds: VaultEntity['id'][];

  byChainId: {
    [chainId in ChainEntity['id']]?: {
      /** Vaults on chain */
      allIds: VaultEntity['id'][];
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
      cowcentratedVault: {
        /** Map of cowcentrated vault ids by deposit token address */
        byDepositTokenAddress: {
          [address: string]: VaultEntity['id'][];
        };
        /** Map of cowcentrated vault id by earned (receipt) token address */
        byEarnedTokenAddress: {
          [address: string]: VaultEntity['id'];
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

  /**
   * We want to know if the vault is featured or not
   */
  featuredVaults: FeaturedVaultConfig;

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
      for (const [chainId, vaults] of entries(action.payload.byChainId)) {
        if (vaults) {
          for (const vault of vaults) {
            addVaultToState(action.payload.state, sliceState, chainId, vault);
          }
        }
      }

      // If new vaults were added, apply default sorting
      if (sliceState.allIds.length !== initialVaultAmount) {
        sliceState.allIds = sortBy(sliceState.allIds, id => {
          return -sliceState.byId[id]!.updatedAt;
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

function getOrCreateVaultsChainState(sliceState: Draft<VaultsState>, chainId: ChainEntity['id']) {
  let vaultState = sliceState.byChainId[chainId];
  if (vaultState === undefined) {
    vaultState = sliceState.byChainId[chainId] = {
      allIds: [],
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
      cowcentratedVault: {
        byEarnedTokenAddress: {},
        byDepositTokenAddress: {},
      },
    };
  }
  return vaultState;
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
  const chainState = getOrCreateVaultsChainState(sliceState, chainId);
  let vault: VaultEntity;

  if (apiVault.type === 'gov') {
    vault = {
      id: apiVault.id,
      name: apiVault.name,
      type: 'gov',
      version: apiVault.version || 1,
      depositTokenAddress: apiVault.tokenAddress || 'native',
      earnedTokenAddress: apiVault.earnedTokenAddress,
      earnContractAddress: apiVault.earnContractAddress,
      strategyTypeId: apiVault.strategyTypeId,
      excludedId: apiVault.excluded || null,
      chainId: chainId,
      status: apiVault.status as VaultGov['status'],
      platformId: apiVault.platformId,
      safetyScore: score,
      assetIds: apiVault.assets || [],
      assetType: 'single',
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: null,
      removeLiquidityUrl: null,
      depositFee: apiVault.depositFee ?? 0,
      createdAt: apiVault.createdAt ?? 0,
      updatedAt: apiVault.updatedAt || apiVault.createdAt || 0,
      retireReason: apiVault.retireReason,
      retiredAt: apiVault.retiredAt,
      pauseReason: apiVault.pauseReason,
      pausedAt: apiVault.pausedAt,
    } satisfies VaultGov;
  } else if (apiVault.type === 'cowcentrated') {
    vault = {
      id: apiVault.id,
      name: apiVault.name,
      type: 'cowcentrated',
      version: apiVault.version || 1,
      depositTokenAddress: apiVault.tokenAddress ?? 'native',
      depositTokenAddresses: apiVault.depositTokenAddresses || [],
      zaps: apiVault.zaps || [],
      earnContractAddress: apiVault.earnContractAddress,
      earnedTokenAddress: apiVault.earnedTokenAddress,
      strategyTypeId: apiVault.strategyTypeId,
      chainId: chainId,
      platformId: apiVault.platformId,
      status: apiVault.status as VaultStandard['status'],
      assetType: 'lps',
      safetyScore: score,
      assetIds: apiVault.assets || [],
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: apiVault.addLiquidityUrl || null,
      removeLiquidityUrl: apiVault.removeLiquidityUrl || null,
      depositFee: apiVault.depositFee ?? 0,
      createdAt: apiVault.createdAt ?? 0,
      updatedAt: apiVault.updatedAt || apiVault.createdAt || 0,
      retireReason: apiVault.retireReason,
      retiredAt: apiVault.retiredAt,
      pauseReason: apiVault.pauseReason,
      pausedAt: apiVault.pausedAt,
      migrationIds: apiVault.migrationIds,
      bridged: apiVault.bridged,
      lendingOracle: apiVault.lendingOracle,
      earningPoints: apiVault.earningPoints ?? false,
    } satisfies VaultCowcentrated;
  } else if (apiVault.type === 'standard' || apiVault.type === undefined) {
    vault = {
      id: apiVault.id,
      name: apiVault.name,
      type: apiVault.type || 'standard',
      version: apiVault.version || 1,
      depositTokenAddress: apiVault.tokenAddress ?? 'native',
      zaps: apiVault.zaps || [],
      earnContractAddress: apiVault.earnContractAddress,
      earnedTokenAddress: apiVault.earnedTokenAddress,
      strategyTypeId: apiVault.strategyTypeId,
      chainId: chainId,
      platformId: apiVault.platformId,
      status: apiVault.status as VaultStandard['status'],
      assetType: !apiVault.assets ? 'single' : apiVault.assets.length > 1 ? 'lps' : 'single',
      safetyScore: score,
      assetIds: apiVault.assets || [],
      risks: apiVault.risks || [],
      buyTokenUrl: apiVault.buyTokenUrl || null,
      addLiquidityUrl: apiVault.addLiquidityUrl || null,
      removeLiquidityUrl: apiVault.removeLiquidityUrl || null,
      depositFee: apiVault.depositFee ?? 0,
      createdAt: apiVault.createdAt ?? 0,
      updatedAt: apiVault.updatedAt || apiVault.createdAt || 0,
      retireReason: apiVault.retireReason,
      retiredAt: apiVault.retiredAt,
      pauseReason: apiVault.pauseReason,
      pausedAt: apiVault.pausedAt,
      migrationIds: apiVault.migrationIds,
      bridged: apiVault.bridged,
      lendingOracle: apiVault.lendingOracle,
      earningPoints: apiVault.earningPoints ?? false,
    } satisfies VaultStandard;
  } else {
    throw new Error(`Unknown vault type: ${apiVault.type}`);
  }

  // Track vault globally
  sliceState.byId[vault.id] = vault;
  sliceState.allIds.push(vault.id);

  // Track vault by chain
  chainState.allIds.push(vault.id);

  if (apiVault.status === 'eol' || apiVault.status === 'paused') {
    chainState.allRetiredIds.push(vault.id);
  } else {
    chainState.allActiveIds.push(vault.id);
  }

  if (isStandardVault(vault)) {
    // List of all standard vaults for deposit token
    const depositTokenKey = vault.depositTokenAddress.toLowerCase();
    const byDepositTokenAddress = chainState.standardVault.byDepositTokenAddress[depositTokenKey];
    if (byDepositTokenAddress === undefined) {
      chainState.standardVault.byDepositTokenAddress[depositTokenKey] = [vault.id];
    } else {
      byDepositTokenAddress.push(vault.id);
    }

    // Standard vaults earned tokens are unique to each vault
    const earnedTokenKey = vault.earnedTokenAddress.toLowerCase();
    chainState.standardVault.byEarnedTokenAddress[earnedTokenKey] = vault.id;

    // Track bridged tokens (like mooBIFI)
    if (vault.bridged) {
      chainState.allBridgedIds.push(vault.id);
      sliceState.allBridgedIds.push(vault.id);
    }
  } else if (isCowcentratedLiquidityVault(vault)) {
    const depositTokenKey = vault.depositTokenAddress.toLowerCase();
    const byDepositTokenAddress =
      chainState.cowcentratedVault.byDepositTokenAddress[depositTokenKey];

    if (vault.bridged) {
      chainState.allBridgedIds.push(vault.id);
      sliceState.allBridgedIds.push(vault.id);
    }
    if (byDepositTokenAddress === undefined) {
      chainState.cowcentratedVault.byDepositTokenAddress[depositTokenKey] = [vault.id];
    } else {
      byDepositTokenAddress.push(vault.id);
    }

    const earnedTokenKey = vault.earnedTokenAddress.toLowerCase();
    chainState.cowcentratedVault.byEarnedTokenAddress[earnedTokenKey] = vault.id;
  } else if (isGovVault(vault)) {
    // List of all gov vaults for deposit token
    const depositTokenKey = vault.depositTokenAddress.toLowerCase();
    const byDepositTokenAddress = chainState.govVault.byDepositTokenAddress[depositTokenKey];
    if (byDepositTokenAddress === undefined) {
      chainState.govVault.byDepositTokenAddress[depositTokenKey] = [vault.id];
    } else {
      byDepositTokenAddress.push(vault.id);
    }
  }
}

function getVaultSafetyScore(
  state: BeefyState,
  chainId: ChainEntity['id'],
  apiVault: VaultConfig
): number {
  let score = 0;
  if (apiVault.risks && apiVault.risks.length > 0) {
    score = safetyScoreNum(apiVault.risks) || 0;
  }

  return score;
}
