import BigNumber from 'bignumber.js';
import { BIG_ZERO } from './big-number';

interface PnlTransaction {
  shares: BigNumber;
  price: BigNumber;
  ppfs: BigNumber;
}

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
      const withdrawUsdAmount = withdrawShareAmount.times(entryPrice);

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

interface ClmPnlState {
  sharesFifo: {
    boughtShares: BigNumber;
    remainingShares: BigNumber;
    token0ToUsd: BigNumber;
    token1ToUsd: BigNumber;
    token0Amount: BigNumber;
    token1Amount: BigNumber;
  }[];
  realizedPnl: PnLBreakdown;
}

interface ClmPnlTransaction {
  shares: BigNumber;
  token0ToUsd: BigNumber;
  token1ToUsd: BigNumber;
  token0Amount: BigNumber;
  token1Amount: BigNumber;
}

export class ClmPnl {
  private state: ClmPnlState;

  constructor() {
    this.state = {
      sharesFifo: [],
      realizedPnl: {
        shares: BIG_ZERO,
        usd: BIG_ZERO,
      },
    };
  }

  addTransaction(transaction: ClmPnlTransaction) {
    if (transaction.shares.isZero()) {
      return;
    }

    if (transaction.shares.isPositive()) {
      this.state.sharesFifo.push({
        boughtShares: transaction.shares,
        remainingShares: transaction.shares,
        token0ToUsd: transaction.token0ToUsd,
        token1ToUsd: transaction.token1ToUsd,
        token0Amount: transaction.token0Amount,
        token1Amount: transaction.token1Amount,
      });
      return;
    }

    let remainingSharesToSell = transaction.shares.negated();
    const remainingToken0SharesToSell = transaction.token0Amount.negated();
    const remainingToken1SharesToSell = transaction.token1Amount.negated();
    let trxPnl = BIG_ZERO;
    let trxPnlUsd = BIG_ZERO;
    let idx = 0;
    for (; idx < this.state.sharesFifo.length; idx++) {
      const { remainingShares, token0Amount, token1Amount, token0ToUsd, token1ToUsd } =
        this.state.sharesFifo[idx];
      if (remainingShares.isZero()) {
        continue;
      }

      const token0AmountToUsd = token0Amount.times(token0ToUsd);
      const token1AmountToUsd = token1Amount.times(token1ToUsd);

      const entryPrice = token0AmountToUsd.plus(token1AmountToUsd);

      const sharesToSell = BigNumber.min(remainingSharesToSell, remainingShares);
      const token0SharesToSell = BigNumber.min(remainingToken0SharesToSell, token0Amount);
      const token1SharesToSell = BigNumber.min(remainingToken1SharesToSell, token1Amount);

      const entryShareAmount = remainingShares;
      const entryUsdAmount = entryShareAmount.times(entryPrice);

      const withdrawShareAmount = sharesToSell.times(1);
      const withdrawUsdAmount = withdrawShareAmount.times(entryPrice);

      trxPnl = trxPnl.plus(withdrawShareAmount.minus(entryShareAmount));
      trxPnlUsd = trxPnlUsd.plus(withdrawUsdAmount.minus(entryUsdAmount));

      remainingSharesToSell = remainingSharesToSell.minus(sharesToSell);
      this.state.sharesFifo[idx].remainingShares = remainingShares.minus(sharesToSell);
      this.state.sharesFifo[idx].token0Amount = token0Amount.minus(token0SharesToSell);
      this.state.sharesFifo[idx].token1Amount = token1Amount.minus(token1SharesToSell);

      if (remainingSharesToSell.isZero()) {
        break;
      }
    }

    this.state.realizedPnl.usd = this.state.realizedPnl.usd.plus(trxPnlUsd);
    this.state.realizedPnl.shares = this.state.realizedPnl.usd.plus(trxPnl);
    return;
  }

  getRemainingShares(): {
    remainingShares: BigNumber;
    token0Shares: BigNumber;
    token1Shares: BigNumber;
  } {
    let remainingShares = BIG_ZERO;
    let token0Shares = BIG_ZERO;
    let token1Shares = BIG_ZERO;
    for (const trx of this.state.sharesFifo) {
      remainingShares = remainingShares.plus(trx.remainingShares);
      token0Shares = token0Shares.plus(trx.token0Amount);
      token1Shares = token1Shares.plus(trx.token1Amount);
    }
    return { remainingShares, token0Shares, token1Shares };
  }

  getRemainingSharesAvgEntryPrice(): { token0EntryPrice: BigNumber; token1EntryPrice: BigNumber } {
    let totalSharesToken0 = BIG_ZERO;
    let totalSharesToken1 = BIG_ZERO;
    let totalCostToken0 = BIG_ZERO;
    let totalCostToken1 = BIG_ZERO;
    for (const { token1Amount, token0Amount, token0ToUsd, token1ToUsd } of this.state.sharesFifo) {
      totalSharesToken0 = totalSharesToken0.plus(token0Amount);
      totalSharesToken1 = totalSharesToken1.plus(token1Amount);
      totalCostToken0 = totalCostToken0.plus(token0Amount.times(token0ToUsd));
      totalCostToken1 = totalCostToken1.plus(token1Amount.times(token1ToUsd));
    }
    return {
      token0EntryPrice: totalCostToken0.div(totalSharesToken0),
      token1EntryPrice: totalCostToken1.div(totalSharesToken1),
    };
  }
}
