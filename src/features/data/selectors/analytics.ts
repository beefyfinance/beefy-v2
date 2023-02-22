import createCachedSelector from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number';
import { PnL } from '../../../helpers/pnl';
import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectUserDepositedTimelineByVaultId = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.user.analytics.byVaultId[vaultId],
  timeline => timeline || []
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

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
    } else {
      console.log('ALERT CHAOS PABLO WILL KILL US ALL');
    }
  }

  //Rewrite to new pnl class
  const balanceAtDeposit = pnl.getRemainingShares().times(pnl.getRemainingSharesAvgEntryPpfs());
  const usdBalanceAtDeposit = balanceAtDeposit.times(pnl.getRemainingSharesAvgEntryPrice());

  const depositNow = pnl.getRemainingShares().times(ppfs);
  const depositUsd = depositNow.times(oraclePrice);

  const totalYield = depositNow.minus(balanceAtDeposit);
  const totalYieldUsd = totalYield.times(oraclePrice);

  // const realizedPnl = pnl.getRealizedPnl();

  const unrealizedPnl = pnl.getUnrealizedPnl(oraclePrice, ppfs);

  // const totalPnlUsd = realizedPnl.usd.plus(unrealizedPnl.usd);
  const totalPnlUsd = unrealizedPnl.usd;

  return {
    totalYield,
    totalYieldUsd,
    totalPnlUsd,
    deposit: depositNow,
    depositUsd,
    usdBalanceAtDeposit,
    balanceAtDeposit,
  };
};

export const selectLastVaultDepositStart = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId);

  let firstDeposit = new Date();

  let remainingShares = BIG_ZERO;

  for (const tx of vaultTimeline) {
    if (!tx.internal) {
      if (remainingShares.isEqualTo(BIG_ZERO)) {
        firstDeposit = tx.datetime;
      }
      remainingShares = remainingShares.plus(tx.shareDiff);
    }
  }

  return firstDeposit;
};
