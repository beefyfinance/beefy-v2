import BigNumber from 'bignumber.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TimelineEntryCowcentratedPool } from '../../features/data/entities/analytics.ts';
import type {
  PnlYieldSource,
  PnlYieldTotal,
} from '../../features/data/selectors/analytics-types.ts';
import {
  type ClmInvestorOverviewTimeSeriesPoint,
  type ClmRewardsAccrualEntry,
  getClmInvestorTimeSeries,
  getClmSideRewards,
  makeClmRewardsAccrual,
  mergeClmOverviewTimeSeries,
} from './timeseries.ts';

function point(
  timestamp: number,
  underlying: number,
  underlyingUsd: number,
  heldUsd: number,
  rewardsUsd = 0
): ClmInvestorOverviewTimeSeriesPoint {
  return {
    timestamp,
    shares: underlying,
    underlying,
    underlyingUsd,
    heldUsd,
    rewardsUsd,
    debug: {},
  } as ClmInvestorOverviewTimeSeriesPoint;
}

describe('mergeClmOverviewTimeSeries', () => {
  it('returns the single side untouched, by reference', () => {
    const only = [point(1, 10, 100, 90)];
    expect(mergeClmOverviewTimeSeries([only])).toBe(only);
    expect(mergeClmOverviewTimeSeries([only, []])).toBe(only);
  });

  it('returns nothing when no side has data', () => {
    expect(mergeClmOverviewTimeSeries([[], []])).toEqual([]);
  });

  it('sums the plotted fields on a shared grid', () => {
    const merged = mergeClmOverviewTimeSeries([
      [point(1, 10, 100, 90), point(2, 11, 110, 95)],
      [point(1, 5, 50, 45), point(2, 6, 60, 50)],
    ]);

    expect(merged.map(p => p.timestamp)).toEqual([1, 2]);
    expect(merged[0].underlying).toBe(15);
    expect(merged[0].underlyingUsd).toBe(150);
    expect(merged[0].heldUsd).toBe(135);
    expect(merged[1].underlyingUsd).toBe(170);
  });

  it('sums rewards like the other USD fields, carrying a side forward', () => {
    // only the pool side has rewards leave the position; the vault side compounds its own
    const merged = mergeClmOverviewTimeSeries([
      [point(1, 10, 100, 90), point(3, 11, 115, 95)],
      [point(1, 5, 50, 45, 1), point(2, 5, 52, 46, 3)],
    ]);

    expect(merged.map(p => p.rewardsUsd)).toEqual([1, 3, 3]);
  });

  it('contributes zero before a side opened, not its first value', () => {
    // the pool side only starts at t=3; the total before that is the vault side alone
    const merged = mergeClmOverviewTimeSeries([
      [point(1, 10, 100, 100), point(2, 10, 100, 100), point(3, 10, 100, 100)],
      [point(3, 5, 50, 50)],
    ]);

    expect(merged.map(p => p.underlyingUsd)).toEqual([100, 100, 150]);
  });

  it('carries a side forward after its last point', () => {
    const merged = mergeClmOverviewTimeSeries([
      [point(1, 10, 100, 100), point(2, 10, 120, 100), point(3, 10, 130, 100)],
      [point(1, 5, 50, 50)],
    ]);

    expect(merged.map(p => p.underlyingUsd)).toEqual([150, 170, 180]);
  });

  it('unions timestamps that do not line up', () => {
    const merged = mergeClmOverviewTimeSeries([
      [point(10, 1, 10, 10), point(30, 1, 30, 10)],
      [point(20, 2, 20, 20)],
    ]);

    expect(merged.map(p => p.timestamp)).toEqual([10, 20, 30]);
    // t=20: vault still at its t=10 value, pool just opened
    expect(merged[1].underlyingUsd).toBe(30);
    // t=30: vault stepped up, pool carried forward
    expect(merged[2].underlyingUsd).toBe(50);
  });

  it('zeroes shares rather than summing incommensurable units', () => {
    const merged = mergeClmOverviewTimeSeries([[point(1, 10, 100, 100)], [point(1, 5, 50, 50)]]);

    expect(merged[0].shares).toBe(0);
  });
});

function entry(t: number, balance: number, claimedUsd = 0): ClmRewardsAccrualEntry {
  return { t, balance: new BigNumber(balance), claimedUsd: new BigNumber(claimedUsd) };
}

const usd = (n: number) => new BigNumber(n);

describe('makeClmRewardsAccrual', () => {
  it('equals claimed plus pending at now, and nothing before the first entry', () => {
    const accrued = makeClmRewardsAccrual([entry(100, 10), entry(200, 10, 4)], usd(6), usd(0), 300);
    expect(accrued(50).toNumber()).toBe(0);
    expect(accrued(100).toNumber()).toBe(0);
    expect(accrued(300).toNumber()).toBe(10);
    expect(accrued(400).toNumber()).toBe(10);
  });

  it('equals everything claimed so far at each claim', () => {
    const accrued = makeClmRewardsAccrual(
      [entry(0, 5), entry(100, 5, 3), entry(150, 8), entry(300, 8, 7)],
      usd(2),
      usd(0),
      400
    );
    expect(accrued(100).toNumber()).toBe(3);
    expect(accrued(300).toNumber()).toBe(10);
    expect(accrued(400).toNumber()).toBe(12);
  });

  it('spreads an amount over its interval at a constant rate per staked unit', () => {
    // balance 1 for 100s, then 2 for 100s: weight 100 then 200, so a third accrues in the first half
    const accrued = makeClmRewardsAccrual([entry(0, 1), entry(100, 2)], usd(9), usd(0), 200);
    expect(accrued(100).toNumber()).toBeCloseTo(3, 12);
    expect(accrued(150).toNumber()).toBeCloseTo(6, 12);
    expect(accrued(200).toNumber()).toBe(9);
  });

  it('lands a claim made in the first entry as a step there', () => {
    // nothing was staked before it in this holding, so there is no interval to spread it over
    const accrued = makeClmRewardsAccrual([entry(100, 5, 2), entry(200, 5)], usd(0), usd(0), 300);
    expect(accrued(99).toNumber()).toBe(0);
    expect(accrued(100).toNumber()).toBe(2);
    expect(accrued(300).toNumber()).toBe(2);
  });

  it('stops accruing when the side retired, holding the total from then on', () => {
    // retired at 150 of a 0..300 holding: pending accrues over 0..150 only
    const accrued = makeClmRewardsAccrual([entry(0, 2)], usd(6), usd(0), 300, 150);
    expect(accrued(75).toNumber()).toBeCloseTo(3, 12);
    expect(accrued(150).toNumber()).toBeCloseTo(6, 12);
    expect(accrued(200).toNumber()).toBeCloseTo(6, 12);
    expect(accrued(300).toNumber()).toBe(6);
  });
  it('spreads untimed rewards over the whole holding, and pending only since the last claim', () => {
    const accrued = makeClmRewardsAccrual([entry(0, 1), entry(100, 1, 2)], usd(4), usd(8), 200);
    // untimed: 4 by t=100; claim: 2 at t=100; pending: 0 until t=100
    expect(accrued(100).toNumber()).toBeCloseTo(6, 12);
    // halfway through the second interval: untimed 6 + claim 2 + pending 2
    expect(accrued(150).toNumber()).toBeCloseTo(10, 12);
    expect(accrued(200).toNumber()).toBe(14);
  });

  it('never decreases', () => {
    const accrued = makeClmRewardsAccrual(
      [entry(0, 3), entry(40, 0), entry(90, 7, 2), entry(130, 1, 5), entry(170, 0, 1)],
      usd(4),
      usd(3),
      250
    );
    let previous = -1;
    for (let t = -10; t <= 260; t += 1) {
      const value = accrued(t).toNumber();
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
    expect(previous).toBe(15);
  });
});

describe('getClmInvestorTimeSeries rewards', () => {
  const DAY = 86400;
  const start = Date.UTC(2026, 0, 1) / 1000;
  const now = start + 10 * DAY;
  const one = new BigNumber(1);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now * 1000);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function poolTx(day: number, shareDiff: number, shareBalance: number, claimedUsd = 0) {
    return {
      type: 'cowcentrated-pool',
      datetime: new Date((start + day * DAY) * 1000),
      shareDiff: new BigNumber(shareDiff),
      shareBalance: new BigNumber(shareBalance),
      underlyingDiff: new BigNumber(shareDiff),
      underlyingBalance: new BigNumber(shareBalance),
      underlyingPerShare: one,
      underlying0Diff: new BigNumber(shareDiff / 2),
      underlying1Diff: new BigNumber(shareDiff / 2),
      underlying0PerUnderlying: new BigNumber(0.5),
      underlying1PerUnderlying: new BigNumber(0.5),
      underlyingToUsd: one,
      token0ToUsd: one,
      token1ToUsd: one,
      // a claim of 2 tokens at $1.50 is $3; a zero claim must not count
      rewardPoolClaimedDetails:
        claimedUsd ?
          [
            {
              address: '0xreward',
              claimedAmount: new BigNumber(2),
              rewardToUsd: new BigNumber(claimedUsd / 2),
            },
            { address: '0xother', claimedAmount: new BigNumber(0), rewardToUsd: new BigNumber(99) },
          ]
        : [],
    } as unknown as TimelineEntryCowcentratedPool;
  }

  const prices = Array.from({ length: 12 }, (_, d) => ({ t: start + d * DAY, v: 1 }));
  // stake 10 on day 0, claim $3 on day 4, stake 10 more on day 6
  const timeline = () => [poolTx(0, 10, 10), poolTx(4, 0, 10, 3), poolTx(6, 10, 20)];

  function series(bucket: '1d_1M' | '1h_1d', pendingUsd: number, untimedUsd = 0) {
    const txs = timeline();
    return getClmInvestorTimeSeries(
      bucket,
      txs,
      prices,
      prices,
      prices,
      txs[0].datetime,
      new BigNumber(20),
      new BigNumber(20),
      new BigNumber(10),
      new BigNumber(10),
      one,
      one,
      one,
      one,
      [],
      undefined,
      { pendingUsd: new BigNumber(pendingUsd), untimedUsd: new BigNumber(untimedUsd) }
    );
  }

  it('ends on claimed plus pending, holds each claim, and leaves the position value alone', () => {
    // $4 claimable now
    const points = series('1d_1M', 4);
    const at = (day: number) => points.find(p => p.timestamp === (start + day * DAY) * 1000)!;

    expect(at(2).rewardsUsd).toBeCloseTo(1.5, 12);
    expect(at(4).rewardsUsd).toBeCloseTo(3, 12);
    // pending accrues over days 4..10 with weight 10×2 + 20×4 = 100
    expect(at(6).rewardsUsd).toBeCloseTo(3 + (4 * 20) / 100, 12);
    expect(at(8).rewardsUsd).toBeCloseTo(3 + (4 * 60) / 100, 12);
    expect(points[points.length - 1].rewardsUsd).toBe(7);
    // value is unchanged by the rewards: 10 then 20 CLM tokens at $1
    expect(at(5).underlyingUsd).toBe(10);
    expect(points[points.length - 1].underlyingUsd).toBe(20);
  });

  it('ends on the header total with every kind of reward at once', () => {
    // $3 claimed + $4 claimable on chain + $5 Merkl (claimed and unclaimed)
    const points = series('1d_1M', 4, 5);
    expect(points[0].rewardsUsd).toBe(0);
    expect(points[points.length - 1].rewardsUsd).toBe(12);
  });

  it('counts a short range from its own start, so it shows what that period earned', () => {
    // the last day only: pending accrues 20 × 1 of the 100 weight since the claim
    const points = series('1h_1d', 4);
    expect(points[0].rewardsUsd).toBe(0);
    expect(points[points.length - 1].rewardsUsd).toBeCloseTo((4 * 20) / 100, 12);
  });
});

describe('getClmSideRewards', () => {
  function source(kind: 'vault' | 'clm' | 'pool' | 'merkl' | 'stellaswap', usd: number) {
    return { source: kind, usd: new BigNumber(usd) } as unknown as PnlYieldSource;
  }
  function total(...sources: PnlYieldSource[]): PnlYieldTotal {
    return {
      usd: sources.reduce((sum, s) => sum.plus(s.usd), new BigNumber(0)),
      tokens: {},
      sources,
    };
  }

  it('takes on-chain pending and untimed rewards, leaving timeline claims and compounding out', () => {
    const rewards = getClmSideRewards({
      claimed: total(source('pool', 3), source('merkl', 5), source('stellaswap', 7)),
      pending: total(source('pool', 4), source('merkl', 11), source('stellaswap', 13)),
    });
    // pool claims come from the timeline itself; compounded yield is already in the value
    expect(rewards.pendingUsd.toNumber()).toBe(4);
    expect(rewards.untimedUsd.toNumber()).toBe(5 + 7 + 11 + 13);
  });
});
