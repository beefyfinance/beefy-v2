import { sortBy } from 'lodash';
import { PnL } from '../../../helpers/pnl';
import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { selectTokenPriceByAddress } from './tokens';
import { selectVaultById, selectVaultPricePerFullShare } from './vaults';

export const selectUserDepositedTimelineByVaultId = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => state.user.analytics.byVaultId[vaultId];

export const selectVaultPnl = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId);
  const sortedTimeline = sortBy(vaultTimeline, 'datetime');

  console.log(sortedTimeline);

  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);

  const ppfs = selectVaultPricePerFullShare(state, vault.id);

  const usdPnL = new PnL();

  for (const row of sortedTimeline) {
    if (row.shareDiff && row.shareToUnderlyingPrice && row.underlyingToUsdPrice) {
      usdPnL.addTransaction({
        shares: row.shareDiff,
        price: row.shareToUnderlyingPrice.times(row.underlyingToUsdPrice),
      });
    }
  }

  const yieldPnL = new PnL();
  for (const row of sortedTimeline) {
    if (row.shareDiff && row.shareToUnderlyingPrice) {
      yieldPnL.addTransaction({
        shares: row.shareDiff,
        price: row.shareToUnderlyingPrice,
      });
    }
  }

  const balanceAtDeposit = yieldPnL.getRemainingShares();
  const usdBalanceAtDeposit = usdPnL.getRemainingSharesAvgEntryPrice().times(balanceAtDeposit);

  const deposit = yieldPnL.getRemainingShares().times(ppfs);
  const depositUsd = deposit.times(oraclePrice);

  const totalYield = yieldPnL.getUnrealizedPnl(ppfs);
  const totalYieldUsd = usdPnL.getUnrealizedPnl(oraclePrice.times(ppfs));

  const realizedPnl = usdPnL.getRealizedPnl();
  const unrelizedPnl = usdPnL.getUnrealizedPnl(oraclePrice.times(ppfs));
  const totalPnlUsd = unrelizedPnl.plus(realizedPnl);

  return {
    totalYield,
    totalYieldUsd,
    totalPnlUsd,
    deposit,
    depositUsd,
    usdBalanceAtDeposit,
    balanceAtDeposit,
  };
};
