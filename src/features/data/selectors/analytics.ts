import { sortBy } from 'lodash';
import { PnL } from '../../../helpers/pnl';
import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';
import { selectTokenByAddress, selectTokenPriceByAddress } from './tokens';
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

  //ppfs locally in app is stored as ppfs/1e18, we need to move it to same format as api
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const ppfs = selectVaultPricePerFullShare(state, vault.id).shiftedBy(18 - depositToken.decimals);
  const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);

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

  console.log('price', oraclePrice.toFixed(6));
  console.log('ppfs', ppfs.toFixed(6));

  const balanceAtDeposit = yieldPnL.getRemainingShares();
  const usdBalanceAtDeposit = usdPnL.getRemainingSharesAvgEntryPrice().times(balanceAtDeposit);

  const deposit = yieldPnL.getRemainingShares().times(ppfs);
  const depositUsd = deposit.times(oraclePrice);

  const realizedYield = yieldPnL.getRealizedPnl();
  const unrealizedYield = yieldPnL.getUnrealizedPnl(ppfs);
  const totalYield = realizedYield.plus(unrealizedYield);

  const totalYieldUsd = totalYield.times(oraclePrice);

  const realizedPnl = usdPnL.getRealizedPnl();
  const unrelizedPnl = usdPnL.getUnrealizedPnl(oraclePrice);
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
