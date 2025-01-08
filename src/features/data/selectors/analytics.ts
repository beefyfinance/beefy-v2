import { createCachedSelector } from 're-reselect';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number';
import { ClmPnl, PnL } from '../../../helpers/pnl';
import type { BeefyState } from '../../../redux-types';
import type { DatabarnProductPriceRow } from '../apis/databarn/databarn-types';
import {
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  type VaultEntity,
} from '../entities/vault';
import {
  selectCowcentratedLikeVaultDepositTokens,
  selectCowcentratedLikeVaultDepositTokensWithPrices,
  selectLpBreakdownForVault,
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from './tokens';
import {
  selectCowcentratedLikeVaultById,
  selectVaultById,
  selectVaultPricePerFullShare,
} from './vaults';
import {
  selectGovVaultPendingRewardsWithPrice,
  selectUserDepositedVaultIds,
  selectUserLpBreakdownBalance,
  selectUserVaultBalanceInShareTokenIncludingBoostsBridged,
} from './balance';
import { selectWalletAddress } from './wallet';
import { selectIsConfigAvailable } from './data-loader';
import {
  type AnyTimelineEntity,
  type AnyTimelineEntry,
  isTimelineEntityCowcentrated,
  isTimelineEntityStandard,
} from '../entities/analytics';
import { createSelector } from '@reduxjs/toolkit';
import {
  type AmountUsd,
  type PnlYieldSource,
  type PnlYieldTotal,
  type TokenEntryNow,
  type UsdChange,
  type UserClmPnl,
  type UserGovPnl,
  type UserStandardPnl,
  type UserVaultPnl,
} from './analytics-types';
import { selectFeesByVaultId } from './fees';
import { BigNumber } from 'bignumber.js';
import {
  createAddressDataSelector,
  hasLoaderFulfilledOnce,
  isLoaderIdle,
} from './data-loader-helpers';
import type { ApiTimeBucketInterval } from '../apis/beefy/beefy-data-api-types';
import type { AnalyticsIntervalData, AnalyticsState } from '../reducers/analytics-types';
import type {
  ClmPriceHistoryEntryClassic,
  ClmPriceHistoryEntryClm,
} from '../apis/clm/clm-api-types';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../utils/vault-utils';
import {
  selectUserMerklRewardsForVault,
  selectUserStellaSwapRewardsForVault,
} from './user-rewards';

export const selectUserAnalytics = createSelector(
  (state: BeefyState, address?: string) => address || selectWalletAddress(state),
  (state: BeefyState, _address?: string) => state.user.analytics,
  (walletAddress, analyticsState): AnalyticsState['byAddress']['0x'] | undefined => {
    if (!walletAddress) {
      return undefined;
    }

    return analyticsState.byAddress[walletAddress.toLowerCase()] || undefined;
  }
);

export const selectUserDepositedTimelineByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], address?: string) =>
    selectUserAnalytics(state, address),
  (state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId,
  (userAnalytics, vaultId): undefined | AnyTimelineEntity => {
    if (!userAnalytics) {
      return undefined;
    }

    return userAnalytics.timeline.byVaultId[vaultId] || undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectUserFullTimelineEntriesByVaultId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], address?: string) =>
    selectUserDepositedTimelineByVaultId(state, vaultId, address),
  (timeline): undefined | AnyTimelineEntry[] => {
    if (!timeline) {
      return undefined;
    }

    return [...timeline.past, ...timeline.current];
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectUserHasCurrentDepositTimelineByVaultId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], address?: string) =>
    selectUserDepositedTimelineByVaultId(state, vaultId, address),
  timeline => {
    return !!timeline && timeline.current.length > 0;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

/**
 * Selects the first deposit date of the user in a vault
 * If the user has fully withdrawn at any point, this will return the date of the first deposit after the last full withdrawal
 */
export const selectUserFirstDepositDateByVaultId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], address?: string) =>
    selectUserDepositedTimelineByVaultId(state, vaultId, address),
  timeline => {
    if (!timeline || timeline.current.length === 0) {
      return undefined;
    }

    return timeline.current[0].datetime;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectIsDashboardDataLoadedByAddress = (state: BeefyState, walletAddress: string) => {
  if (!walletAddress) {
    return false;
  }

  if (!selectIsConfigAvailable(state)) {
    return false;
  }

  const addressLower = walletAddress.toLowerCase();

  const dataByAddress = state.ui.dataLoader.byAddress[addressLower];
  if (!dataByAddress) {
    return false;
  }

  const anyChainBalanceAvailable = Object.values(dataByAddress.byChainId).some(chain =>
    hasLoaderFulfilledOnce(chain.balance)
  );
  if (!anyChainBalanceAvailable) {
    return false;
  }

  const hasDepositedVaults = selectUserDepositedVaultIds(state, walletAddress).length > 0;
  const timelineIdle = selectIsAnalyticsIdleByAddress(state, walletAddress);

  // do not wait if user has no deposits and fetch wallet timeline has not dispatched
  // [as we don't dispatch fetch wallet timeline for users with no deposits]
  if (!hasDepositedVaults && timelineIdle) {
    return true;
  }

  return selectIsAnalyticsLoadedByAddress(state, addressLower);
};

export const selectIsAnalyticsLoadedByAddress = createAddressDataSelector(
  'timeline',
  hasLoaderFulfilledOnce
);

export const selectIsAnalyticsIdleByAddress = createAddressDataSelector('timeline', isLoaderIdle);

export const selectIsClmHarvestsLoadedByAddress = createAddressDataSelector(
  'clmHarvests',
  hasLoaderFulfilledOnce
);

export const selectStandardGovPnl = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserStandardPnl | UserGovPnl => {
  const vault = selectVaultById(state, vaultId);
  if (isCowcentratedLikeVault(vault)) {
    throw new Error('This function should not be called for cowcentrated vaults');
  }

  const sortedTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  // ppfs locally in app is stored as ppfs/1e18, we need to move it to same format as api
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const ppfs = selectVaultPricePerFullShare(state, vault.id).shiftedBy(18 - depositToken.decimals);

  const pnl = new PnL();

  if (isTimelineEntityStandard(sortedTimeline) && sortedTimeline.current.length > 0) {
    for (const row of sortedTimeline.current) {
      if (row.shareDiff && row.shareToUnderlyingPrice && row.underlyingToUsdPrice) {
        pnl.addTransaction({
          shares: row.shareDiff,
          price: row.underlyingToUsdPrice,
          ppfs: row.shareToUnderlyingPrice,
        });
      }
    }
  }

  const oraclePriceAtDeposit = pnl.getRemainingSharesAvgEntryPrice();
  const balanceAtDeposit = pnl.getRemainingShares().times(pnl.getRemainingSharesAvgEntryPpfs());
  const usdBalanceAtDeposit = balanceAtDeposit.times(oraclePriceAtDeposit);

  const depositNow = pnl.getRemainingShares().times(ppfs);
  const depositUsd = depositNow.times(oraclePrice);

  const totalYield = depositNow.minus(balanceAtDeposit);
  const totalYieldUsd = totalYield.times(oraclePrice);

  const unrealizedPnl = pnl.getUnrealizedPnl(oraclePrice, ppfs);

  const totalPnlUsd = unrealizedPnl.usd;

  const yieldPercentage = totalYield.dividedBy(balanceAtDeposit);

  const pnlPercentage = totalPnlUsd.dividedBy(usdBalanceAtDeposit);

  return {
    type: vault.type,
    totalYield,
    totalYieldUsd,
    totalPnlUsd,
    deposit: depositNow,
    depositUsd,
    usdBalanceAtDeposit,
    balanceAtDeposit,
    yieldPercentage,
    pnlPercentage,
    tokenDecimals: depositToken.decimals,
    oraclePrice,
    oraclePriceAtDeposit,
  };
};

function withDiff<T extends TokenEntryNow>(entry: T): T & { diff: AmountUsd } {
  return {
    ...entry,
    diff: {
      amount: entry.now.amount.minus(entry.entry.amount),
      usd: entry.now.usd.minus(entry.entry.usd),
    },
  };
}

function totalYield(sources: Array<PnlYieldSource>): PnlYieldTotal {
  return {
    usd: sources.reduce((acc, { usd }) => acc.plus(usd), BIG_ZERO),
    tokens: sources.reduce<PnlYieldTotal['tokens']>((acc, { token, amount, usd }) => {
      acc[token.address] ??= { token, amount: BIG_ZERO, usd: BIG_ZERO };
      acc[token.address].amount = acc[token.address].amount.plus(amount);
      acc[token.address].usd = acc[token.address].usd.plus(usd);
      return acc;
    }, {}),
    sources,
  };
}

function makeUsdChange(before: BigNumber, after: BigNumber): UsdChange {
  const diff = after.minus(before);
  return {
    usd: diff,
    percentage: before.gt(BIG_ZERO) ? diff.dividedBy(before) : BIG_ZERO,
  };
}

export const selectClmPnl = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserClmPnl => {
  walletAddress ??= selectWalletAddress(state);
  if (!walletAddress) {
    throw new Error('No wallet address provided');
  }

  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  const sortedTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
  const shareToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
  const sharesNow = selectUserVaultBalanceInShareTokenIncludingBoostsBridged(
    state,
    vaultId,
    walletAddress
  );
  const underlyingToken = selectTokenByAddress(
    state,
    vault.chainId,
    getCowcentratedAddressFromCowcentratedLikeVault(vault)
  );
  const underlyingNowPrice = selectTokenPriceByAddress(
    state,
    vault.chainId,
    vault.depositTokenAddress
  );
  const [token0, token1] = selectCowcentratedLikeVaultDepositTokens(state, vaultId);
  const breakdown = selectLpBreakdownForVault(state, vault);
  const { assets, userBalanceDecimal: underlyingNow } = selectUserLpBreakdownBalance(
    state,
    vault,
    breakdown,
    walletAddress
  );

  const token0breakdown = assets[0];
  const token1breakdown = assets[1];

  const clmPnl = new ClmPnl();

  if (isTimelineEntityCowcentrated(sortedTimeline) && sortedTimeline.current.length > 0) {
    for (const tx of sortedTimeline.current) {
      clmPnl.addTransaction({
        shares: tx.shareDiff,
        underlyingToUsd: tx.underlyingToUsd,
        token0ToUsd: tx.token0ToUsd,
        token1ToUsd: tx.token1ToUsd,
        underlyingAmount: tx.underlyingDiff,
        token0Amount: tx.underlying0Diff,
        token1Amount: tx.underlying1Diff,
        claims: tx.rewardPoolClaimedDetails,
      });
    }
  }

  const {
    remainingUnderlying: underlyingAtDeposit,
    remainingToken0: token0AtDeposit,
    remainingToken1: token1AtDeposit,
    remainingShares: sharesAtDeposit,
  } = clmPnl.getRemainingShares();

  const { token0EntryPrice: token0AtDepositPrice, token1EntryPrice: token1AtDepositPrice } =
    clmPnl.getRemainingSharesAvgEntryPrice();

  const underlyingAtDepositInUsd = token0AtDeposit
    .times(token0AtDepositPrice)
    .plus(token1AtDeposit.times(token1AtDepositPrice));
  const underlyingAtDepositPrice = underlyingAtDepositInUsd.dividedBy(underlyingAtDeposit);
  const underlyingNowInUsd = underlyingNow.times(underlyingNowPrice);
  const hold = token0AtDeposit
    .times(token0breakdown.price)
    .plus(token1AtDeposit.times(token1breakdown.price));

  const compounded: Array<PnlYieldSource> = [];
  const claimed: Array<PnlYieldSource> = [];
  const pending: Array<PnlYieldSource> = [];

  // CLM Vault: Additional CLM tokens via vault compounding
  if (underlyingNow.gt(BIG_ZERO) && underlyingAtDeposit.gt(BIG_ZERO)) {
    const underlyingCompounded = underlyingNow.minus(underlyingAtDeposit);
    // TODO: fetch harvests and use usd price at time of harvest?
    compounded.push({
      token: underlyingToken,
      amount: underlyingCompounded,
      usd: underlyingCompounded.times(underlyingNowPrice),
      source: 'vault',
    });
  }

  // CLM Pool: Additional token0/token1 via fee compounding
  const harvestTimeline = selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress);
  if (harvestTimeline) {
    for (const [i, token] of [token0, token1].entries()) {
      if (harvestTimeline.totals[i].gt(BIG_ZERO)) {
        compounded.push({
          token: token,
          amount: harvestTimeline.totals[i],
          usd: harvestTimeline.totalsUsd[i],
          source: 'clm',
        });
      }
    }
  }

  // CLM Pool: Claimed rewards
  for (const [tokenAddress, entry] of Object.entries(clmPnl.getClaimed().tokens)) {
    const token = selectTokenByAddress(state, vault.chainId, tokenAddress);
    claimed.push({ token, amount: entry.amount, usd: entry.usd, source: 'pool' });
  }

  // CLM Pool: Pending rewards
  const pendingRewards = selectGovVaultPendingRewardsWithPrice(state, vaultId, walletAddress);
  for (const reward of pendingRewards) {
    pending.push({
      token: reward.token,
      amount: reward.amount,
      usd: reward.amount.times(reward.price),
      source: 'pool',
    });
  }

  // Merkl/StellaSwap: Claimed + Unclaimed rewards
  // TODO: fetch merkl claims and use usd price at time of claim?
  const merklRewards = selectUserMerklRewardsForVault(state, vaultId, walletAddress);
  const stellaSwapRewards = selectUserStellaSwapRewardsForVault(state, vaultId, walletAddress);
  const offChainRewards = [
    ...(merklRewards ? merklRewards.map(r => ({ ...r, source: 'merkl' as const })) : []),
    ...(stellaSwapRewards
      ? stellaSwapRewards.map(r => ({ ...r, source: 'stellaswap' as const }))
      : []),
  ];
  for (const reward of offChainRewards) {
    const claimedAmount = reward.accumulated.minus(reward.unclaimed);
    const tokenPrice = selectTokenPriceByAddress(state, reward.token.chainId, reward.token.address);
    if (claimedAmount.gt(BIG_ZERO)) {
      claimed.push({
        token: reward.token,
        amount: claimedAmount,
        usd: claimedAmount.times(tokenPrice),
        source: reward.source,
      });
    }
    if (reward.unclaimed.gt(BIG_ZERO)) {
      pending.push({
        token: reward.token,
        amount: reward.unclaimed,
        usd: reward.unclaimed.times(tokenPrice),
        source: reward.source,
      });
    }
  }

  const _shares = withDiff({
    token: shareToken,
    entry: {
      amount: sharesAtDeposit,
      price: underlyingAtDepositInUsd.dividedBy(sharesAtDeposit),
      usd: underlyingAtDepositInUsd,
    },
    now: {
      amount: sharesNow,
      price: underlyingNowInUsd.dividedBy(sharesNow),
      usd: underlyingNowInUsd,
    },
  });

  const _underlying = withDiff({
    token: underlyingToken,
    entry: {
      amount: underlyingAtDeposit,
      price: underlyingAtDepositPrice,
      usd: underlyingAtDepositInUsd,
    },
    now: {
      amount: underlyingNow,
      price: underlyingNowPrice,
      usd: underlyingNowInUsd,
    },
  });

  const _token0 = withDiff({
    token: token0,
    entry: {
      amount: token0AtDeposit,
      price: token0AtDepositPrice,
      usd: token0AtDeposit.times(token0AtDepositPrice),
    },
    now: {
      amount: token0breakdown.userAmount,
      price: token0breakdown.price,
      usd: token0breakdown.userValue,
    },
  });

  const _token1 = withDiff({
    token: token1,
    entry: {
      amount: token1AtDeposit,
      price: token1AtDepositPrice,
      usd: token1AtDeposit.times(token1AtDepositPrice),
    },
    now: {
      amount: token1breakdown.userAmount,
      price: token1breakdown.price,
      usd: token1breakdown.userValue,
    },
  });

  const yields = {
    compounded: totalYield(compounded),
    claimed: totalYield(claimed),
    pending: totalYield(pending),
    usd: BIG_ZERO,
  };
  yields.usd = yields.compounded.usd.plus(yields.claimed.usd).plus(yields.pending.usd);

  const pnl = {
    base: makeUsdChange(underlyingAtDepositInUsd, underlyingNowInUsd),
    withClaimed: makeUsdChange(
      underlyingAtDepositInUsd,
      underlyingNowInUsd.plus(yields.claimed.usd)
    ),
    withClaimedPending: makeUsdChange(
      underlyingAtDepositInUsd,
      underlyingNowInUsd.plus(yields.claimed.usd).plus(yields.pending.usd)
    ),
  };

  const _hold = {
    usd: hold,
    diff: {
      compounded: underlyingNowInUsd.minus(hold),
      withClaimed: underlyingNowInUsd.plus(yields.claimed.usd).minus(hold),
      withClaimedPending: underlyingNowInUsd
        .plus(yields.claimed.usd)
        .plus(yields.pending.usd)
        .minus(hold),
    },
  };

  return {
    type: 'cowcentrated',
    shares: _shares,
    underlying: _underlying,
    tokens: [_token0, _token1],
    hold: _hold,
    yields,
    pnl,
  };
};

export const selectVaultPnl = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserVaultPnl => {
  const vault = selectVaultById(state, vaultId);
  if (isCowcentratedLikeVault(vault)) {
    return selectClmPnl(state, vaultId, walletAddress);
  }
  return selectStandardGovPnl(state, vaultId, walletAddress);
};

const EMPTY_INTERVAL_BUCKET: Readonly<AnalyticsIntervalData<unknown>> = {
  data: [],
  status: 'idle',
  fulfilledSince: 0,
  requestedSince: 0,
};

export const selectShareToUnderlyingByVaultIdByInterval = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  intervalKey: ApiTimeBucketInterval
): Readonly<AnalyticsIntervalData<DatabarnProductPriceRow>> => {
  return (
    state.user.analytics.interval.shareToUnderlying.byVaultId[vaultId]?.byInterval[intervalKey] ||
    EMPTY_INTERVAL_BUCKET
  );
};

export const selectClassicPriceHistoryByVaultIdByInterval = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  intervalKey: ApiTimeBucketInterval
): Readonly<AnalyticsIntervalData<ClmPriceHistoryEntryClassic>> => {
  return (
    state.user.analytics.interval.classicPriceHistory.byVaultId[vaultId]?.byInterval[intervalKey] ||
    EMPTY_INTERVAL_BUCKET
  );
};

export const selectClmPriceHistoryByVaultIdByInterval = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  intervalKey: ApiTimeBucketInterval
): Readonly<AnalyticsIntervalData<ClmPriceHistoryEntryClm>> => {
  return (
    state.user.analytics.interval.clmPriceHistory.byVaultId[vaultId]?.byInterval[intervalKey] ||
    EMPTY_INTERVAL_BUCKET
  );
};

export const selectHasDataToShowGraphByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], walletAddress: string) =>
    selectUserDepositedVaultIds(state, walletAddress),
  (state: BeefyState, _vaultId: VaultEntity['id'], walletAddress) =>
    selectIsAnalyticsLoadedByAddress(state, walletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress: string) =>
    selectVaultById(state, vaultId),
  (userVaults, isLoaded, timeline, vault) => {
    // show clm data for 1 month after vault is retired
    const statusCondition = isCowcentratedLikeVault(vault)
      ? vault.status !== 'eol' ||
        (vault.status === 'eol' && Date.now() / 1000 - (vault.retiredAt || 0) <= 60 * 60 * 24 * 30)
      : vault.status === 'active';

    return (
      isLoaded &&
      userVaults.includes(vault.id) &&
      !!timeline &&
      timeline.current.length !== 0 &&
      (timeline.current[0].type !== 'standard' ||
        timeline.current[0].underlyingToUsdPrice !== null) &&
      statusCondition
    );
  }
)(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    `${walletAddress}-${vaultId}`
);

export const selectClmHarvestsByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.user.analytics.clmHarvests.byVaultId[vaultId];
};

export const selectClassicHarvestsByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.user.analytics.classicHarvests.byVaultId[vaultId];
};

export const selectClmPendingRewardsByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.user.analytics.clmPendingRewards.byVaultId[vaultId];
};

export const selectUserClmHarvestTimelineByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], address?: string) =>
    selectUserAnalytics(state, address),
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress: string) =>
    selectVaultById(state, vaultId),
  (userAnalytics, vault) => {
    if (!userAnalytics) {
      return undefined;
    }

    return isCowcentratedStandardVault(vault)
      ? userAnalytics.clmVaultHarvests.byVaultId[vault.id] || undefined
      : userAnalytics.clmHarvests.byVaultId[vault.id] || undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectUserClmVaultHarvestTimelineByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], address?: string) =>
    selectUserAnalytics(state, address),
  (state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId,
  (userAnalytics, vaultId) => {
    if (!userAnalytics) {
      return undefined;
    }

    return userAnalytics.clmVaultHarvests.byVaultId[vaultId] || undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectClmAutocompoundedPendingFeesByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const [token0, token1] = selectCowcentratedLikeVaultDepositTokensWithPrices(state, vaultId);
  const { price: token0Price, symbol: token0Symbol, decimals: token0Decimals } = token0;
  const { price: token1Price, symbol: token1Symbol, decimals: token1Decimals } = token1;

  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  const harvestTimeline = isCowcentratedStandardVault(vault)
    ? selectUserClmVaultHarvestTimelineByVaultId(state, vaultId, walletAddress)
    : selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress);
  const compoundedYield = harvestTimeline
    ? {
        token0AccruedRewards: harvestTimeline.totals[0],
        token1AccruedRewards: harvestTimeline.totals[1],
        token0AccruedRewardsToUsd: harvestTimeline.totalsUsd[0],
        token1AccruedRewardsToUsd: harvestTimeline.totalsUsd[1],
        totalAutocompounded: harvestTimeline.totalUsd,
      }
    : {
        token0AccruedRewards: BIG_ZERO,
        token1AccruedRewards: BIG_ZERO,
        token0AccruedRewardsToUsd: BIG_ZERO,
        token1AccruedRewardsToUsd: BIG_ZERO,
        totalAutocompounded: BIG_ZERO,
      };

  const pendingYield = {
    pendingRewards0: BIG_ZERO,
    pendingRewards1: BIG_ZERO,
    pendingRewards0ToUsd: BIG_ZERO,
    pendingRewards1ToUsd: BIG_ZERO,
    totalPending: BIG_ZERO,
  };
  const pendingRewards = selectClmPendingRewardsByVaultId(state, vaultId);
  const currentMooTokenBalance = selectUserVaultBalanceInShareTokenIncludingBoostsBridged(
    state,
    vaultId,
    walletAddress
  );

  if (pendingRewards && currentMooTokenBalance.gt(BIG_ZERO)) {
    const { fees0, fees1, totalSupply } = pendingRewards;
    const vaultFees = selectFeesByVaultId(state, vaultId);
    const afterFeesRatio = BIG_ONE.minus(vaultFees?.total || 0);
    pendingYield.pendingRewards0 = currentMooTokenBalance
      .times(fees0)
      .times(afterFeesRatio)
      .dividedBy(totalSupply)
      .decimalPlaces(token0.decimals, BigNumber.ROUND_FLOOR);
    pendingYield.pendingRewards1 = currentMooTokenBalance
      .times(fees1)
      .times(afterFeesRatio)
      .dividedBy(totalSupply)
      .decimalPlaces(token1.decimals, BigNumber.ROUND_FLOOR);
    pendingYield.pendingRewards0ToUsd = pendingYield.pendingRewards0.times(token0Price);
    pendingYield.pendingRewards1ToUsd = pendingYield.pendingRewards1.times(token1Price);
    pendingYield.totalPending = pendingYield.pendingRewards0ToUsd.plus(
      pendingYield.pendingRewards1ToUsd
    );
  }

  return {
    ...compoundedYield,
    ...pendingYield,
    token0Symbol,
    token1Symbol,
    token0Decimals,
    token1Decimals,
  };
};
