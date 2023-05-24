import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number';
import { PnL } from '../../../helpers/pnl';
import type { BeefyState } from '../../../redux-types';
import type { TimeBucketType } from '../apis/analytics/analytics-types';
import type { VaultEntity } from '../entities/vault';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';
import { selectUserDepositedVaultIds } from './balance';

export const selectUserDepositedTimelineByVaultId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.user.analytics.timeline.byVaultId[vaultId],
  timeline => timeline || []
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsAnalyticsLoaded = (state: BeefyState) =>
  state.ui.dataLoader.global.analytics.alreadyLoadedOnce;

export const selectVaultPnl = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);

  const sortedTimeline = selectUserDepositedTimelineByVaultId(state, vaultId);

  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);

  //ppfs locally in app is stored as ppfs/1e18, we need to move it to same format as api
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const ppfs = selectVaultPricePerFullShare(state, vault.id).shiftedBy(18 - depositToken.decimals);

  const pnl = new PnL();
  for (const row of sortedTimeline) {
    if (row.shareDiff && row.shareToUnderlyingPrice && row.underlyingToUsdPrice) {
      if (!row.internal) {
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

export const selectLastVaultDepositStart = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId);

  let firstDepositDate = new Date();

  let previousBalance = BIG_ZERO;

  for (const tx of vaultTimeline) {
    if (previousBalance.isEqualTo(BIG_ZERO)) {
      firstDepositDate = tx.datetime;
    }
    previousBalance = tx.shareBalance;
  }

  return firstDepositDate;
};

export const selectShareToUnderlyingTimebucketByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType
) => {
  return (
    state.user.analytics.shareToUnderlying.byVaultId[vaultId]?.byTimebucket[timebucket] || {
      data: [],
      status: 'idle',
    }
  );
};

export const selectUnderlyingToUsdTimebucketByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType
) => {
  return (
    state.user.analytics.underlyingToUsd.byVaultId[vaultId]?.byTimebucket[timebucket] || {
      data: [],
      status: 'idle',
    }
  );
};

export const selectHasDataToShowGraphByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => selectUserDepositedVaultIds(state),
  (state: BeefyState, _vaultId: VaultEntity['id']) => selectIsAnalyticsLoaded(state),
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectUserDepositedTimelineByVaultId(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (userVaults, isLoaded, timeline, vault, vaultId) => {
    return (
      isLoaded && userVaults.includes(vaultId) && timeline.length !== 0 && vault.status === 'active'
    );
  }
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);
