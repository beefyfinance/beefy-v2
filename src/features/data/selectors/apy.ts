import { first } from 'lodash-es';
import { EMPTY_AVG_APY } from '../../../helpers/apy.ts';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { isEmpty } from '../../../helpers/utils.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  isVaultActive,
  type VaultEntity,
} from '../entities/vault.ts';
import type { AvgApy, TotalApy } from '../reducers/apy-types.ts';
import type { BeefyState } from '../store/types.ts';
import { mooAmountToOracleAmount } from '../utils/ppfs.ts';
import {
  selectBoostUserBalanceInToken,
  selectIsUserBalanceAvailable,
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInDepositTokenIncludingDisplaced,
  selectUserVaultBalanceInUsdIncludingDisplaced,
  selectVaultSharesToDepositTokenData,
} from './balance.ts';
import { selectActiveVaultBoostIds, selectVaultCurrentBoostIdWithStatus } from './boosts.ts';
import { selectIsConfigAvailable } from './config.ts';
import { selectIsContractDataLoadedOnChain } from './contract-data.ts';
import { createGlobalDataSelector, hasLoaderFulfilledOnce } from './data-loader-helpers.ts';
import { selectTokenPriceByAddress } from './tokens.ts';
import { selectVaultById, selectVaultShouldShowInterest } from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';

const EMPTY_TOTAL_APY: TotalApy = {
  totalApy: 0,
  totalMonthly: 0,
  totalDaily: 0,
  totalType: 'apy',
};

export const selectVaultTotalApyOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<TotalApy> | undefined => {
  return state.biz.apy.totalApy.byVaultId[vaultId] || undefined;
};

export const selectVaultTotalApy = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<TotalApy> => {
  return selectVaultTotalApyOrUndefined(state, vaultId) || EMPTY_TOTAL_APY;
};

export const selectVaultAvgApyOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<AvgApy> | undefined => {
  return state.biz.apy.avgApy.byVaultId[vaultId] || undefined;
};

export const selectVaultAvgApy = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): Readonly<AvgApy> => {
  return selectVaultAvgApyOrUndefined(state, vaultId) || EMPTY_AVG_APY;
};

export const selectDidAPIReturnValuesForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] !== undefined;
};

const EMPTY_GLOBAL_STATS = {
  deposited: 0,
  daily: 0,
  monthly: 0,
  yearly: 0,
  apy: 0,
  depositedVaults: 0,
};

/**
 * Ignores boost component of APY
 */
export const selectUserGlobalStats = (state: BeefyState, address?: string) => {
  const walletAddress = address || selectWalletAddress(state);
  if (!walletAddress) {
    return EMPTY_GLOBAL_STATS;
  }

  if (!selectIsUserBalanceAvailable(state, walletAddress)) {
    return EMPTY_GLOBAL_STATS;
  }

  const userVaultIds = selectUserDepositedVaultIds(state, walletAddress);

  if (userVaultIds.length === 0) {
    return EMPTY_GLOBAL_STATS;
  }

  const newGlobalStats = {
    ...EMPTY_GLOBAL_STATS,
    depositedVaults: userVaultIds.length,
  };

  const userVaults = userVaultIds.map(vaultId => selectVaultById(state, vaultId));

  for (const vault of userVaults) {
    const vaultUsdBalance = selectUserVaultBalanceInUsdIncludingDisplaced(
      state,
      vault.id,
      walletAddress
    ).toNumber();

    if (vaultUsdBalance <= 0) {
      continue;
    }

    // Add vault balance to total
    newGlobalStats.deposited += vaultUsdBalance;

    if (!isVaultActive(vault)) {
      continue;
    }

    // Add period totals for each vault
    const apyData = selectVaultTotalApy(state, vault.id);

    if (isEmpty(apyData)) {
      continue;
    }
    const { dailyUsd, monthlyUsd, yearlyUsd } = selectYieldStatsByVaultId(
      state,
      vault.id,
      walletAddress
    );

    newGlobalStats.daily += dailyUsd.toNumber();
    newGlobalStats.monthly += monthlyUsd.toNumber();
    newGlobalStats.yearly += yearlyUsd.toNumber();
  }

  // Skip yield calc if user has no deposits
  if (newGlobalStats.deposited <= 0) {
    return newGlobalStats;
  }

  // Compute average apy
  newGlobalStats.apy = newGlobalStats.yearly / newGlobalStats.deposited;

  return newGlobalStats;
};

export const selectYieldStatsByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const shareData = selectVaultSharesToDepositTokenData(state, vaultId, walletAddress);

  if (!isVaultActive(vault)) {
    return {
      dailyUsd: BIG_ZERO,
      dailyTokens: BIG_ZERO,
      monthlyTokens: BIG_ZERO,
      monthlyUsd: BIG_ZERO,
      yearlyUsd: BIG_ZERO,
      yearlyTokens: BIG_ZERO,
      oraclePrice,
      depositToken: shareData.depositToken,
    };
  }

  const tokenBalance = selectUserVaultBalanceInDepositTokenIncludingDisplaced(
    state,
    vault.id,
    walletAddress
  );
  const apyData = selectVaultTotalApy(state, vault.id);
  const sources = [
    // base total apy is applied to the whole of the user's balance
    {
      daily: apyData.totalDaily,
      yearly: apyData.totalApy,
      tokens: tokenBalance,
    },
  ];

  if (apyData.boostApr !== undefined && apyData.boostDaily !== undefined) {
    const activeBoostId = first(selectActiveVaultBoostIds(state, vaultId));
    if (activeBoostId) {
      const sharesInBoost = selectBoostUserBalanceInToken(state, activeBoostId, walletAddress);
      if (sharesInBoost.gt(BIG_ZERO)) {
        const tokensInBoost =
          shareData.shareToken ?
            mooAmountToOracleAmount(
              shareData.shareToken,
              shareData.depositToken,
              shareData.ppfs,
              sharesInBoost
            )
          : sharesInBoost;

        // boost apy is applied only to the user's balance in the boost
        sources.push({
          daily: apyData.boostDaily,
          yearly: apyData.boostApr,
          tokens: tokensInBoost,
        });
      }
    }
  }

  if (apyData.merklBoostApr !== undefined && apyData.merklBoostDaily !== undefined) {
    // merkl boost apy is applied to the whole of the user's balance
    sources.push({
      daily: apyData.merklBoostDaily,
      yearly: apyData.merklBoostApr,
      tokens: tokenBalance,
    });
  }

  const total = sources.reduce(
    (acc, source) => {
      for (const key of ['daily', 'yearly'] as const) {
        acc[key] = acc[key].plus(source.tokens.multipliedBy(source[key]));
      }
      return acc;
    },
    { daily: BIG_ZERO, yearly: BIG_ZERO }
  );

  const dailyTokens = total.daily;
  const dailyUsd = total.daily.times(oraclePrice);
  const monthlyTokens = dailyTokens.times(30);
  const monthlyUsd = dailyUsd.times(30);
  const yearlyTokens = total.yearly;
  const yearlyUsd = total.yearly.times(oraclePrice);

  return {
    dailyUsd,
    dailyTokens,
    monthlyTokens,
    monthlyUsd,
    yearlyTokens,
    yearlyUsd,
    oraclePrice,
    depositToken: shareData.depositToken,
  };
};

type ApyVaultUIData =
  | {
      status: 'loading' | 'missing' | 'hidden';
      type: 'apy' | 'apr';
    }
  | {
      status: 'available';
      type: 'apy' | 'apr';
      values: TotalApy;
      boosted: 'active' | 'prestake' | undefined;
      averages: AvgApy | undefined;
    };

export const selectIsVaultApyAvailable = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (!selectIsConfigAvailable(state) || !selectIsApyAvailable(state)) {
    return false;
  }

  const vault = selectVaultById(state, vaultId);
  return selectIsContractDataLoadedOnChain(state, vault.chainId);
};

// TEMP: selector instead of connect/mapStateToProps
export function selectApyVaultUIData(
  state: BeefyState,
  vaultId: VaultEntity['id']
): ApyVaultUIData {
  const vault = selectVaultById(state, vaultId);
  const type: 'apr' | 'apy' = vault.type === 'gov' ? 'apr' : 'apy';

  const shouldShowInterest = selectVaultShouldShowInterest(state, vaultId);
  if (!shouldShowInterest) {
    return { status: 'hidden', type };
  }

  const isLoaded = selectIsVaultApyAvailable(state, vaultId);
  if (!isLoaded) {
    return { status: 'loading', type };
  }

  const exists = selectDidAPIReturnValuesForVault(state, vaultId);
  if (!exists) {
    return { status: 'missing', type };
  }

  const values = selectVaultTotalApy(state, vaultId);
  const boost = selectVaultCurrentBoostIdWithStatus(state, vaultId);
  const averages = selectVaultAvgApyOrUndefined(state, vaultId);

  if (boost) {
    return { status: 'available', type, values, boosted: boost.status, averages };
  }

  if (!isCowcentratedVault(vault) && !isCowcentratedGovVault(vault)) {
    return { status: 'available', type, values, boosted: undefined, averages };
  }

  return {
    status: 'available',
    type: values.totalType,
    values,
    boosted: 'boostedTotalDaily' in values ? 'active' : undefined,
    averages,
  };
}

export const selectBoostAprByRewardToken = (state: BeefyState, boostId: BoostPromoEntity['id']) => {
  return state.biz.apy.rawApy.byBoostId[boostId]?.aprByRewardToken || [];
};

export const selectBoostApr = (state: BeefyState, boostId: string): number => {
  return state.biz.apy.rawApy.byBoostId[boostId]?.apr || 0;
};
export const selectIsApyAvailable = createGlobalDataSelector('apy', hasLoaderFulfilledOnce);
export const selectIsAvgApyAvailable = createGlobalDataSelector('avgApy', hasLoaderFulfilledOnce);
