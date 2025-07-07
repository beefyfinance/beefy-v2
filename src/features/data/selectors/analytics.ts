import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { createCachedSelector } from 're-reselect';
import { BIG_ONE, BIG_ZERO, isEqualWithinPercent } from '../../../helpers/big-number.ts';
import { ClmPnl, PnL } from '../../../helpers/pnl.ts';
import type { ApiTimeBucketInterval } from '../apis/beefy/beefy-data-api-types.ts';
import type {
  ClmPriceHistoryEntryClassic,
  ClmPriceHistoryEntryClm,
} from '../apis/clm/clm-api-types.ts';
import type { DatabarnProductPriceRow } from '../apis/databarn/databarn-types.ts';
import {
  type AnyTimelineEntity,
  type AnyTimelineEntry,
  isTimelineEntityCowcentrated,
  isTimelineEntityStandard,
} from '../entities/analytics.ts';
import {
  getCowcentratedPool,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { AnalyticsIntervalData, AnalyticsState } from '../reducers/analytics-types.ts';
import type { BeefyState } from '../store/types.ts';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../utils/vault-utils.ts';
import {
  type AmountUsd,
  type PnlYieldSource,
  type PnlYieldTotal,
  type TokenEntryNow,
  type UsdChange,
  type UserClmPnl,
  type UserErc4626Pnl,
  type UserGovPnl,
  type UserStandardPnl,
  type UserVaultPnl,
} from './analytics-types.ts';
import {
  selectGovVaultPendingRewardsWithPrice,
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInShareTokenIncludingDisplaced,
} from './balance.ts';
import { selectIsConfigAvailable } from './config.ts';
import {
  createAddressDataSelector,
  hasLoaderFulfilledOnce,
  isLoaderIdle,
} from './data-loader-helpers.ts';
import { selectFeesByVaultId } from './fees.ts';
import {
  selectCowcentratedLikeVaultDepositTokens,
  selectCowcentratedLikeVaultDepositTokensWithPrices,
  selectLpBreakdownForVault,
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from './tokens.ts';
import {
  selectUserMerklRewardsForVault,
  selectUserStellaSwapRewardsForVault,
} from './user-rewards.ts';
import {
  selectCowcentratedLikeVaultById,
  selectVaultById,
  selectVaultPricePerFullShare,
} from './vaults.ts';
import { selectWalletAddress } from './wallet.ts';

const PENDING_SHARES_PERCENT = new BigNumber(0.1 / 100); // 0.1%

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
  (_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId,
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
): UserStandardPnl | UserGovPnl | UserErc4626Pnl => {
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

  const sharesAtDeposit = pnl.getRemainingShares();
  const depositNow = sharesAtDeposit.times(ppfs);
  const depositUsd = depositNow.times(oraclePrice);

  const totalYield = depositNow.minus(balanceAtDeposit);
  const totalYieldUsd = totalYield.times(oraclePrice);

  const unrealizedPnl = pnl.getUnrealizedPnl(oraclePrice, ppfs);

  const totalPnlUsd = unrealizedPnl.usd;

  const yieldPercentage = totalYield.dividedBy(balanceAtDeposit);

  const pnlPercentage = totalPnlUsd.dividedBy(usdBalanceAtDeposit);

  const sharesLive = selectUserVaultBalanceInShareTokenIncludingDisplaced(
    state,
    vaultId,
    walletAddress
  );
  const depositLive = sharesLive.times(ppfs);
  const depositLiveUsd = depositLive.times(oraclePrice);

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
    depositLive,
    depositLiveUsd,
    pendingIndex: !isEqualWithinPercent(sharesLive, sharesAtDeposit, PENDING_SHARES_PERCENT),
  };
};

function withDiff<T extends TokenEntryNow>(
  entry: T
): T & {
  diff: AmountUsd;
} {
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
  const underlyingToken = selectTokenByAddress(
    state,
    vault.chainId,
    getCowcentratedAddressFromCowcentratedLikeVault(vault)
  );
  const [token0, token1] = selectCowcentratedLikeVaultDepositTokens(state, vaultId);

  // === Now (Live, on-chain)
  const liveSharesAmount = selectUserVaultBalanceInShareTokenIncludingDisplaced(
    state,
    vaultId,
    walletAddress
  );
  const liveUnderlyingPrice = selectTokenPriceByAddress(
    state,
    vault.chainId,
    vault.depositTokenAddress
  );
  const liveToken0Price = selectTokenPriceByAddress(state, token0.chainId, token0.address);
  const liveToken1Price = selectTokenPriceByAddress(state, token1.chainId, token1.address);
  const liveBreakdown = selectLpBreakdownForVault(state, vault);
  const liveTotalSupply = new BigNumber(liveBreakdown.totalSupply);
  const livePpfs = selectVaultPricePerFullShare(state, vault.id).shiftedBy(
    18 - underlyingToken.decimals
  );
  const liveUnderlyingAmount = liveSharesAmount.times(livePpfs);
  const liveUnderlyingInUsd = liveUnderlyingAmount.times(liveUnderlyingPrice);
  const breakdownTokens = (
    underlyingAmount: BigNumber,
    totalSupply: BigNumber
  ): { token0: BigNumber; token1: BigNumber } => {
    const shareOfPool =
      totalSupply.gt(BIG_ZERO) ? underlyingAmount.dividedBy(totalSupply) : BIG_ZERO;
    return {
      token0: shareOfPool.times(liveBreakdown.balances[0]),
      token1: shareOfPool.times(liveBreakdown.balances[1]),
    };
  };
  const { token0: liveToken0Amount, token1: liveToken1Amount } = breakdownTokens(
    liveUnderlyingAmount,
    liveTotalSupply
  );

  // === PNL
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
    remainingUnderlying: atDepositUnderlyingAmount,
    remainingToken0: atDepositToken0Amount,
    remainingToken1: atDepositToken1Amount,
    remainingShares: atDepositSharesAmount,
  } = clmPnl.getRemainingShares();

  const { token0EntryPrice: atDepositToken0Price, token1EntryPrice: atDepositToken1Price } =
    clmPnl.getRemainingSharesAvgEntryPrice();

  const atDepositUnderlyingInUsd = atDepositToken0Amount
    .times(atDepositToken0Price)
    .plus(atDepositToken1Amount.times(atDepositToken1Price));
  const atDepositUnderlyingPrice = atDepositUnderlyingInUsd.dividedBy(atDepositUnderlyingAmount);
  const hold = atDepositToken0Amount
    .times(liveToken0Price)
    .plus(atDepositToken1Amount.times(liveToken1Price));

  // === Now (Indexed)
  const pendingIndex = !isEqualWithinPercent(
    liveSharesAmount,
    atDepositSharesAmount,
    PENDING_SHARES_PERCENT
  );
  const nowSharesAmount = pendingIndex ? atDepositSharesAmount : liveSharesAmount;
  const nowUnderlyingAmount = nowSharesAmount.times(livePpfs);
  const nowUnderlyingInUsd = nowUnderlyingAmount.times(liveUnderlyingPrice);
  const { token0: nowToken0Amount, token1: nowToken1Amount } = breakdownTokens(
    nowUnderlyingAmount,
    liveTotalSupply.plus(liveUnderlyingAmount.minus(nowUnderlyingAmount))
  );

  // === Yield
  const compounded: Array<PnlYieldSource> = [];
  const claimed: Array<PnlYieldSource> = [];
  const pending: Array<PnlYieldSource> = [];

  // CLM Vault: Additional CLM tokens via vault compounding
  if (nowUnderlyingAmount.gt(BIG_ZERO) && atDepositUnderlyingAmount.gt(BIG_ZERO)) {
    const underlyingCompounded = nowUnderlyingAmount.minus(atDepositUnderlyingAmount);
    // TODO: fetch harvests and use usd price at time of harvest?
    compounded.push({
      token: underlyingToken,
      amount: underlyingCompounded,
      usd: underlyingCompounded.times(liveUnderlyingPrice),
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
    ...(stellaSwapRewards ?
      stellaSwapRewards.map(r => ({ ...r, source: 'stellaswap' as const }))
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
      amount: atDepositSharesAmount,
      price: atDepositUnderlyingInUsd.dividedBy(atDepositSharesAmount),
      usd: atDepositUnderlyingInUsd,
    },
    now: {
      amount: nowSharesAmount,
      price: liveUnderlyingPrice,
      usd: nowUnderlyingInUsd,
    },
    live: {
      amount: liveSharesAmount,
      price: liveUnderlyingPrice,
      usd: liveUnderlyingInUsd,
    },
  });

  const _underlying = withDiff({
    token: underlyingToken,
    entry: {
      amount: atDepositUnderlyingAmount,
      price: atDepositUnderlyingPrice,
      usd: atDepositUnderlyingInUsd,
    },
    now: {
      amount: nowUnderlyingAmount,
      price: liveUnderlyingPrice,
      usd: nowUnderlyingInUsd,
    },
    live: {
      amount: liveUnderlyingAmount,
      price: liveUnderlyingPrice,
      usd: liveUnderlyingInUsd,
    },
  });

  const _token0 = withDiff({
    token: token0,
    entry: {
      amount: atDepositToken0Amount,
      price: atDepositToken0Price,
      usd: atDepositToken0Amount.times(atDepositToken0Price),
    },
    now: {
      amount: nowToken0Amount,
      price: liveToken0Price,
      usd: nowToken0Amount.times(liveToken0Price),
    },
    live: {
      amount: liveToken0Amount,
      price: liveToken0Price,
      usd: liveToken0Amount.times(liveToken0Price),
    },
  });

  const _token1 = withDiff({
    token: token1,
    entry: {
      amount: atDepositToken1Amount,
      price: atDepositToken1Price,
      usd: atDepositToken1Amount.times(atDepositToken1Price),
    },
    now: {
      amount: nowToken1Amount,
      price: liveToken1Price,
      usd: nowToken1Amount.times(liveToken1Price),
    },
    live: {
      amount: liveToken1Amount,
      price: liveToken1Price,
      usd: liveToken1Amount.times(liveToken1Price),
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
    base: makeUsdChange(atDepositUnderlyingInUsd, nowUnderlyingInUsd),
    withClaimed: makeUsdChange(
      atDepositUnderlyingInUsd,
      nowUnderlyingInUsd.plus(yields.claimed.usd)
    ),
    withClaimedPending: makeUsdChange(
      atDepositUnderlyingInUsd,
      nowUnderlyingInUsd.plus(yields.claimed.usd).plus(yields.pending.usd)
    ),
  };

  const _hold = {
    usd: hold,
    diff: {
      compounded: nowUnderlyingInUsd.minus(hold),
      withClaimed: nowUnderlyingInUsd.plus(yields.claimed.usd).minus(hold),
      withClaimedPending: nowUnderlyingInUsd
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
    pendingIndex,
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
    const statusCondition =
      isCowcentratedLikeVault(vault) ?
        vault.status !== 'eol' ||
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
  (_state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
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

    return isCowcentratedStandardVault(vault) ?
        userAnalytics.clmVaultHarvests.byVaultId[vault.id] || undefined
      : userAnalytics.clmHarvests.byVaultId[vault.id] || undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectUserClmVaultHarvestTimelineByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], address?: string) =>
    selectUserAnalytics(state, address),
  (_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId,
  (userAnalytics, vaultId) => {
    if (!userAnalytics) {
      return undefined;
    }

    return userAnalytics.clmVaultHarvests.byVaultId[vaultId] || undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

const selectClmHasPendingFeesOrHarvestsByVaultId = createSelector(
  [selectCowcentratedLikeVaultById, selectClmPendingRewardsByVaultId, selectClmHarvestsByVaultId],
  (vault, pendingRewards, harvests) => {
    if (vault.strategyTypeId !== 'compounds') {
      return false;
    }

    const hasPendingRewards =
      pendingRewards && (!pendingRewards.fees0.isZero() || !pendingRewards.fees1.isZero());
    const hasPastHarvests = harvests && harvests.length > 0;

    // @dev note: will show if any harvest was before user deposit which may not be desired
    return hasPendingRewards || hasPastHarvests;
  }
);

/**
 * Some platforms have option to switch between fees0/1 and reward tokens to reward pool
 * These have 'strategyTypeId' of 'compounds' but may never give any fees to be compounded in the base CLM
 * So we hide the 'fees' chart if there are no (>0) harvests and no pending fees
 * Requires fetchClmHarvestsForXXX and fetchClmPendingRewards to be called
 **/
export const selectClmAutocompoundedFeesEnabledByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  return selectClmHasPendingFeesOrHarvestsByVaultId(
    state,
    // auto compounding is on the base CLM and so is stored on the pool vault id
    getCowcentratedPool(vault) || vault.cowcentratedIds.clm
  );
};

export const selectClmAutocompoundedPendingFeesByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const [token0, token1] = selectCowcentratedLikeVaultDepositTokensWithPrices(state, vaultId);
  const { price: token0Price, symbol: token0Symbol, decimals: token0Decimals } = token0;
  const { price: token1Price, symbol: token1Symbol, decimals: token1Decimals } = token1;

  const vault = selectCowcentratedLikeVaultById(state, vaultId);
  const harvestTimeline =
    isCowcentratedStandardVault(vault) ?
      selectUserClmVaultHarvestTimelineByVaultId(state, vaultId, walletAddress)
    : selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress);
  const compoundedYield =
    harvestTimeline ?
      {
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
  const currentMooTokenBalance = selectUserVaultBalanceInShareTokenIncludingDisplaced(
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
