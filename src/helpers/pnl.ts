import BigNumber from 'bignumber.js';
import type {
  AmountPriceUsd,
  AmountUsd,
  PnlYieldTotal,
  TokenEntryNowDiff,
  UsdChange,
  UserClmGroupPnl,
  UserClmPnl,
} from '../features/data/selectors/analytics-types.ts';
import { BIG_ZERO } from './big-number.ts';

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
    this.state.realizedPnl.shares = this.state.realizedPnl.shares.plus(trxPnl);
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
    underlyingToUsd: BigNumber;
    token0ToUsd: BigNumber;
    token1ToUsd: BigNumber;
    underlyingAmount: BigNumber;
    token0Amount: BigNumber;
    token1Amount: BigNumber;
  }[];
  claimed: {
    totalUsd: BigNumber;
    tokens: {
      [address: string]: {
        amount: BigNumber;
        usd: BigNumber;
      };
    };
  };
}

interface ClmPnlTransaction {
  shares: BigNumber;
  underlyingToUsd: BigNumber;
  token0ToUsd: BigNumber;
  token1ToUsd: BigNumber;
  underlyingAmount: BigNumber;
  token0Amount: BigNumber;
  token1Amount: BigNumber;
  claims: {
    address: string;
    rewardToUsd: BigNumber;
    claimedAmount: BigNumber;
  }[];
}

export class ClmPnl {
  private state: ClmPnlState;

  constructor() {
    this.state = {
      sharesFifo: [],
      claimed: {
        totalUsd: BIG_ZERO,
        tokens: {},
      },
    };
  }

  addTransaction(transaction: ClmPnlTransaction) {
    for (const claim of transaction.claims) {
      if (claim.claimedAmount.gt(BIG_ZERO)) {
        this.state.claimed.tokens[claim.address] ??= { amount: BIG_ZERO, usd: BIG_ZERO };
        this.state.claimed.tokens[claim.address].amount = this.state.claimed.tokens[
          claim.address
        ].amount.plus(claim.claimedAmount);
        const claimedAmountUsd = claim.claimedAmount.multipliedBy(claim.rewardToUsd);
        this.state.claimed.tokens[claim.address].usd =
          this.state.claimed.tokens[claim.address].usd.plus(claimedAmountUsd);
        this.state.claimed.totalUsd = this.state.claimed.totalUsd.plus(claimedAmountUsd);
      }
    }

    if (transaction.shares.isZero()) {
      return;
    }

    if (transaction.shares.isPositive()) {
      this.state.sharesFifo.push({
        boughtShares: transaction.shares,
        remainingShares: transaction.shares,
        underlyingToUsd: transaction.underlyingToUsd,
        token0ToUsd: transaction.token0ToUsd,
        token1ToUsd: transaction.token1ToUsd,
        underlyingAmount: transaction.underlyingAmount,
        token0Amount: transaction.token0Amount,
        token1Amount: transaction.token1Amount,
      });
      return;
    }

    let remainingSharesToSell = transaction.shares.negated();
    for (let idx = 0; idx < this.state.sharesFifo.length; idx++) {
      const { remainingShares, underlyingAmount, token0Amount, token1Amount } =
        this.state.sharesFifo[idx];
      if (remainingShares.isZero()) {
        continue;
      }

      const sharesToSell = BigNumber.min(remainingSharesToSell, remainingShares);
      const underlyingToSell = sharesToSell.times(underlyingAmount).dividedBy(remainingShares);
      const token0ToSell = sharesToSell.times(token0Amount).dividedBy(remainingShares);
      const token1ToSell = sharesToSell.times(token1Amount).dividedBy(remainingShares);

      remainingSharesToSell = remainingSharesToSell.minus(sharesToSell);
      this.state.sharesFifo[idx].remainingShares = remainingShares.minus(sharesToSell);
      this.state.sharesFifo[idx].underlyingAmount = underlyingAmount.minus(underlyingToSell);
      this.state.sharesFifo[idx].token0Amount = token0Amount.minus(token0ToSell);
      this.state.sharesFifo[idx].token1Amount = token1Amount.minus(token1ToSell);

      if (remainingSharesToSell.isZero()) {
        break;
      }
    }
  }

  getRemainingShares(): {
    remainingShares: BigNumber;
    remainingUnderlying: BigNumber;
    remainingToken0: BigNumber;
    remainingToken1: BigNumber;
  } {
    let remainingShares = BIG_ZERO;
    let remainingUnderlying = BIG_ZERO;
    let remainingToken0 = BIG_ZERO;
    let remainingToken1 = BIG_ZERO;
    for (const trx of this.state.sharesFifo) {
      remainingShares = remainingShares.plus(trx.remainingShares);
      remainingUnderlying = remainingUnderlying.plus(trx.underlyingAmount);
      remainingToken0 = remainingToken0.plus(trx.token0Amount);
      remainingToken1 = remainingToken1.plus(trx.token1Amount);
    }
    return { remainingShares, remainingUnderlying, remainingToken0, remainingToken1 };
  }

  getRemainingSharesAvgEntryPrice(): {
    token0EntryPrice: BigNumber;
    token1EntryPrice: BigNumber;
  } {
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
    // an empty queue would divide 0/0; NaN propagates silently through every later .plus()
    return {
      token0EntryPrice:
        totalSharesToken0.isZero() ? BIG_ZERO : totalCostToken0.div(totalSharesToken0),
      token1EntryPrice:
        totalSharesToken1.isZero() ? BIG_ZERO : totalCostToken1.div(totalSharesToken1),
    };
  }

  getClaimed() {
    return this.state.claimed;
  }
}

function usdChange(before: BigNumber, after: BigNumber): UsdChange {
  const diff = after.minus(before);
  return {
    usd: diff,
    percentage: before.gt(BIG_ZERO) ? diff.dividedBy(before) : BIG_ZERO,
  };
}

function sum(values: BigNumber[]): BigNumber {
  return values.reduce((acc, v) => acc.plus(v), BIG_ZERO);
}

function mergeAmountUsd(parts: AmountUsd[]): AmountUsd {
  return { amount: sum(parts.map(p => p.amount)), usd: sum(parts.map(p => p.usd)) };
}

/** price is intensive: derive it from the summed totals rather than averaging the parts */
function mergeAmountPriceUsd(parts: AmountPriceUsd[]): AmountPriceUsd {
  const { amount, usd } = mergeAmountUsd(parts);
  return { amount, usd, price: amount.isZero() ? BIG_ZERO : usd.dividedBy(amount) };
}

function mergeEntryNowDiff(parts: TokenEntryNowDiff[]): TokenEntryNowDiff {
  return {
    token: parts[0].token,
    now: mergeAmountPriceUsd(parts.map(p => p.now)),
    entry: mergeAmountPriceUsd(parts.map(p => p.entry)),
    live: mergeAmountPriceUsd(parts.map(p => p.live)),
    diff: mergeAmountUsd(parts.map(p => p.diff)),
  };
}

function mergeYieldTotal(parts: PnlYieldTotal[]): PnlYieldTotal {
  const tokens: PnlYieldTotal['tokens'] = {};
  for (const part of parts) {
    for (const [address, entry] of Object.entries(part.tokens)) {
      const existing = tokens[address];
      tokens[address] =
        existing ?
          {
            token: existing.token,
            amount: existing.amount.plus(entry.amount),
            usd: existing.usd.plus(entry.usd),
          }
        : entry;
    }
  }
  return {
    usd: sum(parts.map(p => p.usd)),
    tokens,
    // sources are disjoint by construction: 'vault' only on the autocompounding side, 'pool' only
    // on the claimable one, and merkl/stellaswap are deduped upstream across the group
    sources: parts.flatMap(p => p.sources),
  };
}

/**
 * Combine per-side CLM results into one group position.
 *
 * Only extensive quantities are summed. Every price and percentage is re-derived from those sums,
 * because an unweighted average of per-side rates is biased toward the smaller position. Callers
 * must pass only sides the user actually holds — a side with an empty FIFO contributes zeros whose
 * derived ratios are meaningless.
 */
export function mergeClmPnl(sides: UserClmPnl[]): UserClmGroupPnl {
  const entryUsd = sum(sides.map(s => s.underlying.entry.usd));
  const nowUsd = sum(sides.map(s => s.underlying.now.usd));
  const holdUsd = sum(sides.map(s => s.hold.usd));

  const yields = {
    compounded: mergeYieldTotal(sides.map(s => s.yields.compounded)),
    claimed: mergeYieldTotal(sides.map(s => s.yields.claimed)),
    pending: mergeYieldTotal(sides.map(s => s.yields.pending)),
    usd: sum(sides.map(s => s.yields.usd)),
  };

  const withClaimed = nowUsd.plus(yields.claimed.usd);
  const withClaimedPending = withClaimed.plus(yields.pending.usd);

  return {
    type: 'cowcentrated',
    underlying: mergeEntryNowDiff(sides.map(s => s.underlying)),
    tokens: [
      mergeEntryNowDiff(sides.map(s => s.tokens[0])),
      mergeEntryNowDiff(sides.map(s => s.tokens[1])),
    ],
    hold: {
      usd: holdUsd,
      diff: {
        compounded: nowUsd.minus(holdUsd),
        withClaimed: withClaimed.minus(holdUsd),
        withClaimedPending: withClaimedPending.minus(holdUsd),
      },
    },
    yields,
    pnl: {
      base: usdChange(entryUsd, nowUsd),
      withClaimed: usdChange(entryUsd, withClaimed),
      withClaimedPending: usdChange(entryUsd, withClaimedPending),
    },
    // one stale side makes the whole total stale
    pendingIndex: sides.some(s => s.pendingIndex),
  };
}
