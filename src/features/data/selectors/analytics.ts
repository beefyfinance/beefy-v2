import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number';
import { PnL } from '../../../helpers/pnl';
import type { BeefyState } from '../../../redux-types';
import type { TimeBucketType } from '../apis/analytics/analytics-types';
import type { VaultEntity } from '../entities/vault';
import { isGovVault } from '../entities/vault';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';
import { selectUserDepositedVaultIds } from './balance';
import { selectWalletAddress } from './wallet';

export const selectUserDepositedTimelineByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id'], address?: string) =>
    address || selectWalletAddress(state),
  (state: BeefyState, _vaultId: VaultEntity['id'], _address?: string) => state.user.analytics,
  (state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId,
  (walletAddress, analyticsState, vaultId) =>
    analyticsState.byAddress[walletAddress?.toLocaleLowerCase()]?.timeline.byVaultId[vaultId] || []
)((state: BeefyState, vaultId: VaultEntity['id'], _address?: string) => vaultId);

export const selectIsDashboardDataLoadedByAddress = (state: BeefyState, walletAddress: string) => {
  const dataByAddress = state.ui.dataLoader.byAddress[walletAddress?.toLocaleLowerCase()];

  const timelineLoaded = selectIsAnalyticsLoadedByAddress(state, walletAddress);

  if (timelineLoaded) {
    for (const chainId of Object.values(dataByAddress.byChainId)) {
      if (chainId.balance.alreadyLoadedOnce && chainId.balance.status === 'fulfilled') {
        // if any chain has already loaded, then  data is available
        return true;
      }
    }
  }

  return false;
};

export const selectIsAnalyticsLoadedByAddress = (state: BeefyState, walletAddress: string) => {
  return state.ui.dataLoader.timelineByAddress[walletAddress]?.alreadyLoadedOnce || false;
};

export const selectVaultPnl = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vault = selectVaultById(state, vaultId);

  const sortedTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);

  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);

  //ppfs locally in app is stored as ppfs/1e18, we need to move it to same format as api
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const ppfs = selectVaultPricePerFullShare(state, vault.id).shiftedBy(18 - depositToken.decimals);

  const pnl = new PnL();
  for (const row of sortedTimeline) {
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

export const selectLastVaultDepositStart = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);

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
  timebucket: TimeBucketType,
  address?: string
) => {
  const walletAddress = address || selectWalletAddress(state);
  return (
    state.user.analytics.byAddress[walletAddress]?.shareToUnderlying.byVaultId[vaultId]
      ?.byTimebucket[timebucket] || {
      data: [],
      status: 'idle',
    }
  );
};

export const selectUnderlyingToUsdTimebucketByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  timebucket: TimeBucketType,
  address?: string
) => {
  const walletAddress = address || selectWalletAddress(state);
  return (
    state.user.analytics.byAddress[walletAddress?.toLocaleLowerCase()]?.underlyingToUsd.byVaultId[
      vaultId
    ]?.byTimebucket[timebucket] || {
      data: [],
      status: 'idle',
    }
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
    return (
      isLoaded &&
      userVaults.includes(vaultId) &&
      timeline.length !== 0 &&
      vault.status === 'active' &&
      !isGovVault(vault)
    );
  }
)(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress: string) =>
    `${walletAddress}-${vaultId}`
);
