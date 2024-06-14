import { createCachedSelector } from 're-reselect';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number';
import { ClmPnl, PnL } from '../../../helpers/pnl';
import type { BeefyState } from '../../../redux-types';
import type { TimeBucketType } from '../apis/analytics/analytics-types';
import {
  isCowcentratedVault,
  isGovVault,
  isStandardVault,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
} from '../entities/vault';
import {
  selectCowcentratedVaultDepositTokens,
  selectCowcentratedVaultDepositTokensWithPrices,
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';
import {
  selectUserDepositedVaultIds,
  selectUserLpBreakdownBalanceOrNull,
  selectUserRewardsByVaultId,
  selectUserVaultBalanceInShareToken,
} from './balance';
import { selectWalletAddress } from './wallet';
import {
  isLoaderAvailable,
  selectIsAddressDataAvailable,
  selectIsConfigAvailable,
  selectIsUserBalanceAvailable,
} from './data-loader';
import type { AnalyticsBucketData, AnalyticsState } from '../reducers/analytics';
import type {
  AnyTimelineAnalyticsEntity,
  CLMTimelineAnalyticsEntity,
  VaultTimelineAnalyticsEntity,
} from '../entities/analytics';
import { createSelector } from '@reduxjs/toolkit';
import {
  isUserClmPnl,
  isUserGovPnl,
  isUserStandardPnl,
  type UserClmPnl,
  type UserGovPnl,
  type UserStandardPnl,
  type UserVaultPnl,
} from './analytics-types';
import { selectFeesByVaultId } from './fees';
import BigNumber from 'bignumber.js';
import { pick } from 'lodash-es';

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
  (
    userAnalytics,
    vaultId
  ): undefined | VaultTimelineAnalyticsEntity[] | CLMTimelineAnalyticsEntity[] => {
    if (!userAnalytics) {
      return undefined;
    }

    return userAnalytics.timeline.byVaultId[vaultId] || undefined;
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
    if (!timeline || timeline.length === 0) {
      return undefined;
    }

    const firstDepositIndex =
      timeline.findLastIndex((tx: AnyTimelineAnalyticsEntity) => tx.shareBalance.isZero()) + 1;
    return timeline[firstDepositIndex]?.datetime;
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
  const timelineLoaded = selectIsAnalyticsLoadedByAddress(state, addressLower);
  if (!timelineLoaded) {
    return false;
  }

  const dataByAddress = state.ui.dataLoader.byAddress[addressLower];
  if (!dataByAddress) {
    return false;
  }

  for (const chainId of Object.values(dataByAddress.byChainId)) {
    if (isLoaderAvailable(chainId.balance)) {
      // if any chain has already loaded, then data is available
      return true;
    }
  }

  return false;
};

export const selectIsAnalyticsLoadedByAddress = (state: BeefyState, walletAddress: string) =>
  selectIsAddressDataAvailable(state, walletAddress, 'timeline');

export const selectStandardGovPnl = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserStandardPnl | UserGovPnl => {
  const vault = selectVaultById(state, vaultId);
  if (isCowcentratedVault(vault)) {
    throw new Error('This function should not be called for cowcentrated vaults');
  }

  const sortedTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress) || [];
  const currentPositionStartDate = selectUserFirstDepositDateByVaultId(
    state,
    vaultId,
    walletAddress
  );
  const timelineSinceLastDeposit = sortedTimeline.filter((tx: VaultTimelineAnalyticsEntity) =>
    currentPositionStartDate ? tx.datetime.getTime() >= currentPositionStartDate.getTime() : true
  );

  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);

  //ppfs locally in app is stored as ppfs/1e18, we need to move it to same format as api
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const ppfs = selectVaultPricePerFullShare(state, vault.id).shiftedBy(18 - depositToken.decimals);

  const pnl = new PnL();
  for (const row of timelineSinceLastDeposit as VaultTimelineAnalyticsEntity[]) {
    if (row.shareDiff && row.shareToUnderlyingPrice && row.underlyingToUsdPrice) {
      pnl.addTransaction({
        shares: row.shareDiff,
        price: row.underlyingToUsdPrice,
        ppfs: row.shareToUnderlyingPrice,
      });
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

export const selectClmPnl = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserClmPnl => {
  const vault = selectVaultById(state, vaultId);

  const sortedTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress) || [];
  const currentPositionStartDate = selectUserFirstDepositDateByVaultId(
    state,
    vaultId,
    walletAddress
  );
  const timelineSinceLastDeposit = sortedTimeline.filter((tx: CLMTimelineAnalyticsEntity) =>
    currentPositionStartDate ? tx.datetime.getTime() >= currentPositionStartDate.getTime() : true
  );

  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);

  const userLpBreakdown = selectUserLpBreakdownBalanceOrNull(state, vault, walletAddress);

  const { token0, token1 } = userLpBreakdown
    ? { token1: userLpBreakdown.assets[1], token0: userLpBreakdown.assets[0] }
    : { token0: undefined, token1: undefined };

  const pnl = new ClmPnl();

  for (const tx of timelineSinceLastDeposit as CLMTimelineAnalyticsEntity[]) {
    pnl.addTransaction({
      shares: tx.shareDiff,
      token0ToUsd: tx.token0ToUsd,
      token1ToUsd: tx.token1ToUsd,
      token0Amount: tx.underlying0Diff,
      token1Amount: tx.underlying1Diff,
    });
  }

  const { token0Shares, token1Shares, remainingShares } = pnl.getRemainingShares();
  const { token0EntryPrice, token1EntryPrice } = pnl.getRemainingSharesAvgEntryPrice();

  const oraclePriceAtDeposit = token0Shares
    .times(token0EntryPrice)
    .plus(token1Shares.times(token1EntryPrice));

  const positionPnl =
    userLpBreakdown?.userBalanceDecimal?.times(oraclePrice).minus(oraclePriceAtDeposit) || BIG_ZERO;

  const sharesNowToUsd = remainingShares.times(oraclePrice);

  const hold =
    token0 && token1
      ? token0Shares.times(token0.price).plus(token1Shares.times(token1.price))
      : BIG_ZERO;

  const harvestTimeline = selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress);

  const compoundedYield = harvestTimeline
    ? {
        total0Compounded: harvestTimeline.totals[0],
        total1Compounded: harvestTimeline.totals[1],
        total0CompoundedUsd: harvestTimeline.totalsUsd[0],
        total1CompoundedUsd: harvestTimeline.totalsUsd[1],
        totalCompoundedUsd: harvestTimeline.totalUsd,
      }
    : {
        total0Compounded: BIG_ZERO,
        total1Compounded: BIG_ZERO,
        total0CompoundedUsd: BIG_ZERO,
        total1CompoundedUsd: BIG_ZERO,
        totalCompoundedUsd: BIG_ZERO,
      };

  return {
    type: 'cowcentrated',
    userSharesAtDeposit: remainingShares,
    token0EntryPrice,
    token1EntryPrice,
    token0SharesAtDeposit: token0Shares,
    token1SharesAtDeposit: token1Shares,
    token0SharesAtDepositToUsd: token0Shares.times(token0EntryPrice),
    token1SharesAtDepositToUsd: token1Shares.times(token1EntryPrice),
    sharesAtDepositToUsd: oraclePriceAtDeposit,
    shares: remainingShares,
    sharesNowToUsd,
    token0,
    token1,
    token0Diff: token0 ? token0.userAmount.minus(token0Shares) : BIG_ZERO,
    token1Diff: token1 ? token1.userAmount.minus(token1Shares) : BIG_ZERO,
    pnl: positionPnl,
    pnlPercentage: positionPnl.dividedBy(oraclePriceAtDeposit),
    hold,
    holdDiff: sharesNowToUsd.minus(hold),
    ...compoundedYield,
  };
};

export const selectVaultPnl = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
): UserVaultPnl => {
  const vault = selectVaultById(state, vaultId);
  if (isCowcentratedVault(vault)) {
    return selectClmPnl(state, vaultId, walletAddress);
  }
  return selectStandardGovPnl(state, vaultId, walletAddress);
};

const EMPTY_TIMEBUCKET: AnalyticsBucketData = {
  data: [],
  status: 'idle',
};

export const selectShareToUnderlyingTimebucketByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType,
  address?: string
): AnalyticsBucketData => {
  const walletAddress = address || selectWalletAddress(state);
  if (!walletAddress) {
    return { ...EMPTY_TIMEBUCKET };
  }

  const addressKey = walletAddress.toLowerCase();
  const addressState = state.user.analytics.byAddress[addressKey];

  if (!addressState) {
    return { ...EMPTY_TIMEBUCKET };
  }

  const vaultState = addressState.shareToUnderlying.byVaultId[vaultId];
  if (!vaultState) {
    return { ...EMPTY_TIMEBUCKET };
  }

  const bucketState = vaultState.byTimebucket[timebucket];
  if (!bucketState) {
    return { ...EMPTY_TIMEBUCKET };
  }

  return bucketState;
};

export const selectUnderlyingToUsdTimebucketByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType,
  address?: string
) => {
  const walletAddress = address || selectWalletAddress(state);
  if (!walletAddress) {
    return { ...EMPTY_TIMEBUCKET };
  }

  return (
    state.user.analytics.byAddress[walletAddress.toLowerCase()]?.underlyingToUsd.byVaultId[vaultId]
      ?.byTimebucket[timebucket] || { ...EMPTY_TIMEBUCKET }
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

  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress: string) => vaultId,

  (userVaults, isLoaded, timeline, vault, vaultId) => {
    // show clm data for 1 month after vault is retired
    const statusCondition = isCowcentratedVault(vault)
      ? vault.status !== 'eol' ||
        (vault.status === 'eol' && Date.now() / 1000 - (vault.retiredAt || 0) <= 60 * 60 * 24 * 30)
      : vault.status === 'active';

    return (
      isLoaded &&
      userVaults.includes(vaultId) &&
      !!timeline &&
      timeline.length !== 0 &&
      statusCondition &&
      !isGovVault(vault)
    );
  }
)(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    `${walletAddress}-${vaultId}`
);

export const selectClmHarvestsByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.user.analytics.clmHarvests.byVaultId[vaultId];
};

export const selectClmPendingRewardsByVaultId = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.user.analytics.clmPendingRewards.byVaultId[vaultId];
};

export const selectUserClmHarvestTimelineByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], address?: string) =>
    selectUserAnalytics(state, address),
  (state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId,
  (userAnalytics, vaultId) => {
    if (!userAnalytics) {
      return undefined;
    }

    return userAnalytics.clmHarvests.byVaultId[vaultId] || undefined;
  }
)((_state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectClmAutocompoundedPendingFeesByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const { token0, token1 } = selectCowcentratedVaultDepositTokensWithPrices(state, vaultId);
  const { price: token0Price, symbol: token0Symbol, decimals: token0Decimals } = token0;
  const { price: token1Price, symbol: token1Symbol, decimals: token1Decimals } = token1;

  const harvestTimeline = selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress);
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
  const currentMooTokenBalance = selectUserVaultBalanceInShareToken(state, vaultId, walletAddress);
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

export enum DashboardDataStatus {
  Loading,
  Missing,
  Available,
}

function selectDashboardYieldGovData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultGov,
  _pnl: UserGovPnl
) {
  const { totalRewardsUsd } = selectUserRewardsByVaultId(state, vault.id, walletAddress);
  return { type: vault.type, totalRewardsUsd, hasRewards: totalRewardsUsd.gt(BIG_ZERO) };
}

function selectDashboardYieldStandardData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultStandard,
  pnl: UserStandardPnl
) {
  if (!selectIsAnalyticsLoadedByAddress(state, walletAddress)) {
    return DashboardDataStatus.Loading;
  }

  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vault.id, walletAddress);
  if (!vaultTimeline) {
    return DashboardDataStatus.Missing;
  }

  const { rewards, totalRewardsUsd } = selectUserRewardsByVaultId(state, vault.id, walletAddress);
  const { totalYield, totalYieldUsd, tokenDecimals } = pnl;
  return {
    type: vault.type,
    totalRewardsUsd,
    hasRewards: rewards.length > 0,
    totalYield,
    totalYieldUsd,
    tokenDecimals,
  };
}

function selectDashboardYieldCowcentratedData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultCowcentrated,
  pnl: UserClmPnl
) {
  if (
    !selectIsAnalyticsLoadedByAddress(state, walletAddress) ||
    !selectIsAddressDataAvailable(state, walletAddress, 'clmHarvests')
  ) {
    return DashboardDataStatus.Loading;
  }

  const { rewards, totalRewardsUsd } = selectUserRewardsByVaultId(state, vault.id, walletAddress);
  const tokens = selectCowcentratedVaultDepositTokens(state, vault.id);
  return {
    type: vault.type,
    ...tokens,
    ...pick(pnl, [
      'total0Compounded',
      'total1Compounded',
      'total0CompoundedUsd',
      'total1CompoundedUsd',
      'totalCompoundedUsd',
    ]),
    totalRewardsUsd,
    hasRewards: rewards.length > 0,
  };
}

export function selectDashboardYieldVaultData(
  state: BeefyState,
  walletAddress: string,
  vault: VaultEntity,
  pnl: UserVaultPnl
) {
  // Common load check
  if (!selectIsUserBalanceAvailable(state, walletAddress)) {
    return DashboardDataStatus.Loading;
  }

  if (isGovVault(vault) && isUserGovPnl(pnl)) {
    return selectDashboardYieldGovData(state, walletAddress, vault, pnl);
  } else if (isStandardVault(vault) && isUserStandardPnl(pnl)) {
    return selectDashboardYieldStandardData(state, walletAddress, vault, pnl);
  } else if (isCowcentratedVault(vault) && isUserClmPnl(pnl)) {
    return selectDashboardYieldCowcentratedData(state, walletAddress, vault, pnl);
  }

  throw new Error('Invalid vault/pnl type');
}
