import BigNumber from 'bignumber.js';
import type { ApiPoint } from '../features/data/apis/beefy/beefy-data-api-types.ts';
import { PnL } from './pnl.ts';

type CurrencyTransaction = {
  datetime: Date;
  shareDiff: BigNumber;
  shareToUnderlyingPrice: BigNumber;
  underlyingToUsdPrice: BigNumber | null;
};

export function calculatePnlInCurrency(
  transactions: CurrencyTransaction[],
  prices: ApiPoint[],
  currentCurrencyPrice: BigNumber,
  currentUnderlyingPrice: BigNumber,
  currentPpfs: BigNumber,
  yieldUsd: BigNumber
) {
  if (!currentCurrencyPrice.isFinite() || !currentCurrencyPrice.gt(0)) return null;
  const sortedPrices = prices
    .filter(p => Number.isFinite(p.v) && p.v > 0)
    .toSorted((a, b) => a.t - b.t);
  const pnl = new PnL();
  for (const row of transactions.toSorted((a, b) => a.datetime.getTime() - b.datetime.getTime())) {
    if (row.shareDiff.isZero()) continue;
    const timestamp = row.datetime.getTime() / 1000;
    const price = sortedPrices.findLast(p => p.t <= timestamp);
    if (!price || timestamp - price.t > 2 * 86400 || !row.underlyingToUsdPrice) return null;
    pnl.addTransaction({
      shares: row.shareDiff,
      ppfs: row.shareToUnderlyingPrice,
      price: row.underlyingToUsdPrice.div(price.v),
    });
  }
  const currentPrice = currentUnderlyingPrice.div(currentCurrencyPrice);
  const now = pnl.getRemainingShares().times(currentPpfs).times(currentPrice);
  const profit = pnl.getUnrealizedPnl(currentPrice, currentPpfs).usd;
  const atDeposit = now.minus(profit);
  return {
    atDeposit,
    now,
    yield: yieldUsd.div(currentCurrencyPrice),
    pnl: profit,
    percentage: atDeposit.isZero() ? new BigNumber(0) : profit.div(atDeposit),
  };
}
