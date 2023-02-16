import BigNumber from 'bignumber.js';
import { BIG_ZERO } from './big-number';

interface PnlTransaction {
  shares: BigNumber;
  price: BigNumber;
  ppfs: BigNumber;
}

//FIFO => First in First Out
//LIFO => Last in first out

export interface PnLBreakdown {
  shares: BigNumber;
  usd: BigNumber;
}

type PnLState = {
  sharesFifo: {
    boughtShares: BigNumber;
    remainingShares: BigNumber;
    entryPrice: BigNumber;
    entryPpfs: BigNumber;
  }[];
  realizedPnl: PnLBreakdown;
};

// this one is a FIFO pnl calculator:
// https://money.stackexchange.com/a/144091
export class PnL {
  private state: PnLState;

  constructor() {
    this.state = {
      sharesFifo: [],
      realizedPnl: {
        shares: BIG_ZERO,
        usd: BIG_ZERO,
      },
    };
  }

  addTransaction(transaction: PnlTransaction) {
    if (transaction.shares.isZero()) {
      return;
    }

    if (transaction.shares.isPositive()) {
      this.state.sharesFifo.push({
        boughtShares: transaction.shares,
        remainingShares: transaction.shares,
        entryPrice: transaction.price,
        entryPpfs: transaction.ppfs,
      });
      return;
    }

    let remainingSharesToSell = transaction.shares.negated();
    let trxPnl = BIG_ZERO;
    let trxPnlUsd = BIG_ZERO;
    let idx = 0;
    for (; idx < this.state.sharesFifo.length; idx++) {
      const { remainingShares, entryPpfs: ppfs, entryPrice } = this.state.sharesFifo[idx];
      if (remainingShares.isZero()) {
        continue;
      }

      const sharesToSell = BigNumber.min(remainingSharesToSell, remainingShares);

      const entryShareAmount = remainingShares.times(ppfs);
      const entryUsdAmount = entryShareAmount.times(entryPrice);

      const withdrawShareAmount = sharesToSell.times(transaction.ppfs);
      const withdrawUsdAmount = withdrawShareAmount.times(transaction.price);

      trxPnl = trxPnl.plus(withdrawShareAmount.minus(entryShareAmount));
      trxPnlUsd = trxPnlUsd.plus(withdrawUsdAmount.minus(entryUsdAmount));

      remainingSharesToSell = remainingSharesToSell.minus(sharesToSell);
      this.state.sharesFifo[idx].remainingShares = remainingShares.minus(sharesToSell);

      if (remainingSharesToSell.isZero()) {
        break;
      }
    }

    this.state.realizedPnl.usd = this.state.realizedPnl.usd.plus(trxPnlUsd);
    this.state.realizedPnl.shares = this.state.realizedPnl.usd.plus(trxPnl);
    return;
  }

  getUnrealizedPnl(currentPrice: BigNumber, ppfs: BigNumber): PnLBreakdown {
    const unrealizedPnl = {
      usd: BIG_ZERO,
      shares: BIG_ZERO,
    };

    for (const { remainingShares, entryPpfs, entryPrice } of this.state.sharesFifo) {
      if (remainingShares.isZero()) {
        continue;
      }
      const currentShareAmount = remainingShares.times(ppfs);
      const currentUsdAmount = currentShareAmount.times(currentPrice);

      const entryShareAmount = remainingShares.times(entryPpfs);
      const entryUsdAmount = entryShareAmount.times(entryPrice);

      unrealizedPnl.shares = unrealizedPnl.shares.plus(currentShareAmount.minus(entryShareAmount));
      unrealizedPnl.usd = unrealizedPnl.usd.plus(currentUsdAmount.minus(entryUsdAmount));
    }
    return unrealizedPnl;
  }

  getRealizedPnl(): PnLBreakdown {
    return this.state.realizedPnl;
  }

  getRemainingShares(): BigNumber {
    let remainingShares = BIG_ZERO;
    for (const trx of this.state.sharesFifo) {
      remainingShares = remainingShares.plus(trx.remainingShares);
    }
    return remainingShares;
  }

  getRemainingSharesAvgEntryPrice(): BigNumber {
    let totalShares = BIG_ZERO;
    let totalCost = BIG_ZERO;
    for (const { remainingShares, entryPrice } of this.state.sharesFifo) {
      totalShares = totalShares.plus(remainingShares);
      totalCost = totalCost.plus(remainingShares.times(entryPrice));
    }
    if (totalShares.isZero()) {
      return BIG_ZERO;
    }
    return totalCost.div(totalShares);
  }

  getRemainingSharesAvgEntryPpfs(): BigNumber {
    let totalShares = BIG_ZERO;
    let totalPpfs = BIG_ZERO;
    for (const { remainingShares, entryPpfs } of this.state.sharesFifo) {
      totalShares = totalShares.plus(remainingShares);
      totalPpfs = totalPpfs.plus(remainingShares.times(entryPpfs));
    }
    if (totalShares.isZero()) {
      return BIG_ZERO;
    }
    return totalPpfs.div(totalShares);
  }
}
