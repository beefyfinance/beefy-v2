import { sortBy } from 'lodash';
import { PnL, PnLBreakdown } from '../../../helpers/pnl';
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

  const realizedPnl = pnl.getRealizedPnl();
  console.log('realized pnl');
  printPnl(realizedPnl);
  const unrealizedPnl = pnl.getUnrealizedPnl(oraclePrice, ppfs);
  console.log('unrealized pnl');
  printPnl(unrealizedPnl);

  // const totalPnlUsd = realizedPnl.usd.plus(unrealizedPnl.usd);
  const totalPnlUsd = unrealizedPnl.usd;

  return {
    totalYield: totalYield,
    totalYieldUsd: totalYieldUsd,
    totalPnlUsd: totalPnlUsd,
    deposit: depositNow,
    depositUsd,
    usdBalanceAtDeposit,
    balanceAtDeposit,
  };
};

const printPnl = (pnl: PnLBreakdown) => {
  console.log(`usd: ${pnl.usd.toString()} - shares: ${pnl.shares.toString()}`);
};
