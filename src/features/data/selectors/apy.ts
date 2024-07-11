import type { BeefyState } from '../../../redux-types';
import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  isGovVault,
  isVaultActive,
  type VaultEntity,
} from '../entities/vault';
import {
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
} from './balance';
import {
  selectIsUserBalanceAvailable,
  selectIsVaultApyAvailable,
  selectVaultShouldShowInterest,
} from './data-loader';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectUserActiveBoostBalanceInToken, selectVaultCurrentBoostIdWithStatus } from './boosts';
import type { TotalApy } from '../reducers/apy';
import { isEmpty } from '../../../helpers/utils';
import { selectWalletAddress } from './wallet';
import { BigNumber } from 'bignumber.js';
import { createCachedSelector } from 're-reselect';

const EMPTY_TOTAL_APY: TotalApy = {
  totalApy: 0,
  totalMonthly: 0,
  totalDaily: 0,
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

export const selectDidAPIReturnValuesForVault = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.apy.totalApy.byVaultId[vaultId] !== undefined;
};

export const selectGovVaultHasPoolApr = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultTotalApyOrUndefined(state, vaultId),
  apy => {
    return !!apy && ((apy.rewardPoolApr || 0) > 0 || (apy.rewardPoolTradingApr || 0) > 0);
  }
)((_, vaultId) => vaultId);

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
    const vaultUsdBalance = selectUserVaultBalanceInUsdIncludingBoostsBridged(
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

    newGlobalStats.daily += vaultUsdBalance * apyData.totalDaily;
    newGlobalStats.monthly += vaultUsdBalance * apyData.totalMonthly;
    newGlobalStats.yearly += vaultUsdBalance * apyData.totalApy;
  }

  // Skip yield calc if user has no deposits
  if (newGlobalStats.deposited <= 0) {
    return newGlobalStats;
  }

  // Compute average apy
  newGlobalStats.apy = newGlobalStats.yearly / newGlobalStats.deposited;

  return newGlobalStats;
};

export const selectVaultDailyYieldStats = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

  if (!isVaultActive(vault)) {
    return {
      dailyUsd: BIG_ZERO,
      dailyTokens: BIG_ZERO,
      oraclePrice,
      tokenDecimals: depositToken.decimals,
    };
  }

  const tokenBalance = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
    state,
    vault.id,
    walletAddress
  );
  const vaultUsdBalance = tokenBalance.times(oraclePrice);
  const apyData = selectVaultTotalApy(state, vault.id);

  let dailyUsd: BigNumber;
  let dailyTokens: BigNumber;

  if (isGovVault(vault)) {
    dailyUsd = vaultUsdBalance.times(apyData.totalDaily);
    dailyTokens = tokenBalance.times(apyData.totalDaily);
  } else {
    const ppfs = selectVaultPricePerFullShare(state, vaultId);
    const boostBalance = selectUserActiveBoostBalanceInToken(state, vaultId, walletAddress)
      .multipliedBy(ppfs)
      .decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR);
    const boostBalanceUsd = boostBalance.times(oraclePrice);

    const nonBoostBalanceInTokens = tokenBalance.minus(boostBalance);
    const nonBoostBalanceInUsd = nonBoostBalanceInTokens.times(oraclePrice);

    dailyUsd = nonBoostBalanceInUsd.times(apyData.totalDaily);
    dailyTokens = nonBoostBalanceInTokens.times(apyData.totalDaily);

    if (apyData.boostedTotalDaily !== undefined && boostBalance.gt(BIG_ZERO)) {
      dailyUsd = dailyUsd.plus(boostBalanceUsd.times(apyData.boostedTotalDaily));
      dailyTokens = dailyTokens.plus(boostBalance.times(apyData.boostedTotalDaily));
    }
  }

  return { dailyUsd, dailyTokens, oraclePrice, tokenDecimals: depositToken.decimals };
};

type ApyVaultUIData =
  | { status: 'loading' | 'missing' | 'hidden'; type: 'apy' | 'apr' }
  | {
      status: 'available';
      type: 'apy' | 'apr';
      values: TotalApy;
      boosted: 'active' | 'prestake' | undefined;
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
  if (boost) {
    return { status: 'available', type, values, boosted: boost.status };
  }

  if (!isCowcentratedVault(vault) && !isCowcentratedGovVault(vault)) {
    return { status: 'available', type, values, boosted: undefined };
  }

  return {
    status: 'available',
    type: vault.strategyTypeId === 'compounds' ? 'apy' : 'apr',
    values,
    boosted: 'boostedTotalDaily' in values ? 'active' : undefined,
  };
}
