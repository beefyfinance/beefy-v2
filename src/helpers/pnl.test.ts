import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type {
  AmountPriceUsd,
  PnlYieldSource,
  TokenEntryNowDiff,
  UserClmPnl,
} from '../features/data/selectors/analytics-types.ts';
import type { TokenEntity } from '../features/data/entities/token.ts';
import { BIG_ZERO } from './big-number.ts';
import { ClmPnl, mergeClmPnl } from './pnl.ts';

const n = (v: number | string) => new BigNumber(v);

const token = (symbol: string) =>
  ({ symbol, address: `0x${symbol}`, chainId: 'base', decimals: 18 }) as unknown as TokenEntity;

function amount(a: number, price: number): AmountPriceUsd {
  return { amount: n(a), price: n(price), usd: n(a * price) };
}

function entry(
  sym: string,
  entryAmount: number,
  entryPrice: number,
  nowAmount: number,
  nowPrice: number
): TokenEntryNowDiff {
  const e = amount(entryAmount, entryPrice);
  const now = amount(nowAmount, nowPrice);
  return {
    token: token(sym),
    entry: e,
    now,
    live: now,
    diff: { amount: now.amount.minus(e.amount), usd: now.usd.minus(e.usd) },
  };
}

function emptyYieldTotal() {
  return { usd: BIG_ZERO, tokens: {}, sources: [] as PnlYieldSource[] };
}

/** a side whose underlying entry/now USD drive pnl and hold */
function side(opts: {
  entryUsd: number;
  nowUsd: number;
  holdUsd: number;
  claimedUsd?: number;
  pendingUsd?: number;
  pendingIndex?: boolean;
  compoundedSources?: PnlYieldSource[];
}): UserClmPnl {
  const { entryUsd, nowUsd, holdUsd } = opts;
  const claimedUsd = opts.claimedUsd ?? 0;
  const pendingUsd = opts.pendingUsd ?? 0;
  const withClaimed = nowUsd + claimedUsd;
  const withClaimedPending = withClaimed + pendingUsd;
  const change = (after: number) => ({
    usd: n(after - entryUsd),
    percentage: entryUsd > 0 ? n((after - entryUsd) / entryUsd) : BIG_ZERO,
  });

  return {
    type: 'cowcentrated',
    shares: entry('share', 1, entryUsd, 1, nowUsd),
    underlying: entry('lp', 1, entryUsd, 1, nowUsd),
    tokens: [
      entry('t0', 1, entryUsd / 2, 1, nowUsd / 2),
      entry('t1', 1, entryUsd / 2, 1, nowUsd / 2),
    ],
    hold: {
      usd: n(holdUsd),
      diff: {
        compounded: n(nowUsd - holdUsd),
        withClaimed: n(withClaimed - holdUsd),
        withClaimedPending: n(withClaimedPending - holdUsd),
      },
    },
    yields: {
      usd: n(claimedUsd + pendingUsd),
      compounded: { ...emptyYieldTotal(), sources: opts.compoundedSources ?? [] },
      claimed: { ...emptyYieldTotal(), usd: n(claimedUsd) },
      pending: { ...emptyYieldTotal(), usd: n(pendingUsd) },
    },
    pnl: {
      base: change(nowUsd),
      withClaimed: change(withClaimed),
      withClaimedPending: change(withClaimedPending),
    },
    pendingIndex: opts.pendingIndex ?? false,
  };
}

describe('mergeClmPnl', () => {
  it('sums the extensive USD quantities', () => {
    const merged = mergeClmPnl([
      side({ entryUsd: 1000, nowUsd: 1100, holdUsd: 1050 }),
      side({ entryUsd: 100, nowUsd: 150, holdUsd: 120 }),
    ]);

    expect(merged.underlying.entry.usd.toNumber()).toBe(1100);
    expect(merged.underlying.now.usd.toNumber()).toBe(1250);
    expect(merged.hold.usd.toNumber()).toBe(1170);
    expect(merged.pnl.base.usd.toNumber()).toBe(150);
  });

  it('weights the percentage by basis rather than averaging the sides', () => {
    // pool 1000 @ +5%, vault 100 @ +50%: gain 100 on basis 1100 = +9.09%,
    // NOT the +27.5% an unweighted mean of the two rates would report
    const merged = mergeClmPnl([
      side({ entryUsd: 1000, nowUsd: 1050, holdUsd: 1000 }),
      side({ entryUsd: 100, nowUsd: 150, holdUsd: 100 }),
    ]);

    expect(merged.pnl.base.percentage.toNumber()).toBeCloseTo(100 / 1100, 10);
    expect(merged.pnl.base.percentage.toNumber()).not.toBeCloseTo(0.275, 3);
  });

  it('derives price from the summed totals, not from the parts', () => {
    const a = side({ entryUsd: 100, nowUsd: 100, holdUsd: 100 });
    const b = side({ entryUsd: 300, nowUsd: 300, holdUsd: 300 });
    // both sides hold 1 unit, so the merged price is 400/2 = 200
    const merged = mergeClmPnl([a, b]);

    expect(merged.underlying.now.amount.toNumber()).toBe(2);
    expect(merged.underlying.now.usd.toNumber()).toBe(400);
    expect(merged.underlying.now.price.toNumber()).toBe(200);
  });

  it('keeps hold diffs consistent with the summed yields', () => {
    const merged = mergeClmPnl([
      side({ entryUsd: 1000, nowUsd: 1100, holdUsd: 1000, claimedUsd: 30, pendingUsd: 10 }),
      side({ entryUsd: 500, nowUsd: 520, holdUsd: 500, claimedUsd: 5, pendingUsd: 2 }),
    ]);

    expect(merged.yields.claimed.usd.toNumber()).toBe(35);
    expect(merged.yields.pending.usd.toNumber()).toBe(12);
    expect(merged.hold.diff.compounded.toNumber()).toBe(1620 - 1500);
    expect(merged.hold.diff.withClaimed.toNumber()).toBe(1620 + 35 - 1500);
    expect(merged.hold.diff.withClaimedPending.toNumber()).toBe(1620 + 35 + 12 - 1500);
  });

  it('concatenates yield sources so vault and pool attribution both survive', () => {
    const vaultSource: PnlYieldSource = {
      token: token('lp'),
      amount: n(1),
      usd: n(10),
      source: 'vault',
    };
    const poolSource: PnlYieldSource = {
      token: token('cake'),
      amount: n(2),
      usd: n(20),
      source: 'pool',
    };
    const merged = mergeClmPnl([
      side({ entryUsd: 100, nowUsd: 110, holdUsd: 100, compoundedSources: [vaultSource] }),
      side({ entryUsd: 100, nowUsd: 110, holdUsd: 100, compoundedSources: [poolSource] }),
    ]);

    expect(merged.yields.compounded.sources.map(s => s.source)).toEqual(['vault', 'pool']);
  });

  it('treats the whole total as pending when any side is pending', () => {
    const merged = mergeClmPnl([
      side({ entryUsd: 100, nowUsd: 100, holdUsd: 100 }),
      side({ entryUsd: 100, nowUsd: 100, holdUsd: 100, pendingIndex: true }),
    ]);

    expect(merged.pendingIndex).toBe(true);
  });

  it('is an identity for a single side', () => {
    const only = side({ entryUsd: 1000, nowUsd: 1234, holdUsd: 1100, claimedUsd: 7 });
    const merged = mergeClmPnl([only]);

    expect(merged.underlying.now.usd.toNumber()).toBe(only.underlying.now.usd.toNumber());
    expect(merged.pnl.base.usd.toNumber()).toBe(only.pnl.base.usd.toNumber());
    expect(merged.pnl.base.percentage.toNumber()).toBeCloseTo(
      only.pnl.base.percentage.toNumber(),
      10
    );
    expect(merged.hold.diff.withClaimed.toNumber()).toBe(only.hold.diff.withClaimed.toNumber());
  });

  it('does not produce NaN when a side contributes nothing', () => {
    const merged = mergeClmPnl([
      side({ entryUsd: 1000, nowUsd: 1100, holdUsd: 1000 }),
      side({ entryUsd: 0, nowUsd: 0, holdUsd: 0 }),
    ]);

    expect(merged.pnl.base.percentage.isNaN()).toBe(false);
    expect(merged.underlying.now.price.isNaN()).toBe(false);
    expect(merged.pnl.base.usd.toNumber()).toBe(100);
  });

  it('yields a zero percentage rather than NaN when nothing was ever deposited', () => {
    const merged = mergeClmPnl([side({ entryUsd: 0, nowUsd: 0, holdUsd: 0 })]);

    expect(merged.pnl.base.percentage.toNumber()).toBe(0);
    expect(merged.underlying.now.price.toNumber()).toBe(0);
  });
});

/**
 * Cross-check on the FIFO itself: with no partial withdrawals, the remaining basis must equal the
 * net of what went in and came out. Independent of the lot machinery, so a regression in the
 * proration or the queue walk fails here rather than shipping a plausible wrong number.
 */
describe('ClmPnl net-deposit invariant', () => {
  const tx = (shares: number, underlying: number, t0: number, t1: number, price = 1) => ({
    shares: n(shares),
    underlyingToUsd: n(price),
    token0ToUsd: n(price),
    token1ToUsd: n(price),
    underlyingAmount: n(underlying),
    token0Amount: n(t0),
    token1Amount: n(t1),
    claims: [],
  });

  it('matches net deposits when nothing is withdrawn', () => {
    const pnl = new ClmPnl();
    pnl.addTransaction(tx(100, 100, 50, 50));
    pnl.addTransaction(tx(50, 50, 25, 25));

    const remaining = pnl.getRemainingShares();
    expect(remaining.remainingShares.toNumber()).toBe(150);
    expect(remaining.remainingUnderlying.toNumber()).toBe(150);
    expect(remaining.remainingToken0.toNumber()).toBe(75);
    expect(remaining.remainingToken1.toNumber()).toBe(75);
  });

  it('matches net deposits after whole-lot withdrawals', () => {
    const pnl = new ClmPnl();
    pnl.addTransaction(tx(100, 100, 50, 50));
    pnl.addTransaction(tx(50, 50, 25, 25));
    pnl.addTransaction(tx(-100, -100, -50, -50));

    const remaining = pnl.getRemainingShares();
    expect(remaining.remainingShares.toNumber()).toBe(50);
    expect(remaining.remainingUnderlying.toNumber()).toBe(50);
    expect(remaining.remainingToken0.toNumber()).toBe(25);
  });

  it('prorates a partial withdrawal by share fraction, not by gross underlying', () => {
    // 100 shares carrying 100 underlying; selling half must leave half the basis behind
    const pnl = new ClmPnl();
    pnl.addTransaction(tx(100, 100, 50, 50));
    pnl.addTransaction(tx(-50, -60, -30, -30));

    const remaining = pnl.getRemainingShares();
    expect(remaining.remainingShares.toNumber()).toBe(50);
    // 50, not 40 — the extra 10 underlying withdrawn was yield, not basis
    expect(remaining.remainingUnderlying.toNumber()).toBe(50);
    expect(remaining.remainingToken0.toNumber()).toBe(25);
  });

  it('empties completely on a full exit', () => {
    const pnl = new ClmPnl();
    pnl.addTransaction(tx(100, 100, 50, 50));
    pnl.addTransaction(tx(-100, -100, -50, -50));

    const remaining = pnl.getRemainingShares();
    expect(remaining.remainingShares.toNumber()).toBe(0);
    expect(remaining.remainingUnderlying.toNumber()).toBe(0);
    const { token0EntryPrice, token1EntryPrice } = pnl.getRemainingSharesAvgEntryPrice();
    expect(token0EntryPrice.isNaN()).toBe(false);
    expect(token1EntryPrice.isNaN()).toBe(false);
  });
});
