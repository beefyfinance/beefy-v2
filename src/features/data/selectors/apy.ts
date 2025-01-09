import type { BeefyState } from '../../../redux-types';
import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  isVaultActive,
  type VaultEntity,
} from '../entities/vault';
import {
  selectBoostUserBalanceInToken,
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
  selectVaultSharesToDepositTokenData,
} from './balance';
import {
  selectIsUserBalanceAvailable,
  selectIsVaultApyAvailable,
  selectVaultShouldShowInterest,
} from './data-loader';
import { selectTokenPriceByAddress } from './tokens';
import { selectVaultById } from './vaults';
import { BIG_ZERO } from '../../../helpers/big-number';
import { selectActiveVaultBoostIds, selectVaultCurrentBoostIdWithStatus } from './boosts';
import type { TotalApy } from '../reducers/apy';
import { isEmpty } from '../../../helpers/utils';
import { selectWalletAddress } from './wallet';
import { first } from 'lodash-es';
import { mooAmountToOracleAmount } from '../utils/ppfs';

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

  const tokenBalance = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(
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
        const tokensInBoost = shareData.shareToken
          ? mooAmountToOracleAmount(
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
      for (const key of ['daily', 'yearly']) {
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
    type: values.totalType,
    values,
    boosted: 'boostedTotalDaily' in values ? 'active' : undefined,
  };
}
