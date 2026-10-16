import { describe, expect, it } from 'vitest';
import type { ApiRevenueStats } from '../apis/beefy/beefy-data-api-types.ts';
import {
  changeOverPeriod,
  parseCompleteWeeks,
  type RevenueWeek,
  sumChainTvl,
  WEEK_SECONDS,
  weekSeries,
  withMovingAverage,
} from './platform-stats.ts';

const DAY = 24 * 60 * 60;

describe('parseCompleteWeeks', () => {
  const row = (t: number, extra: Partial<ApiRevenueStats[number]> = {}) => ({
    t,
    harvests_total_usd: '100.5',
    fees_platform_usd: '10',
    buyback_total_usd: '5',
    buyback_amount: '0.25',
    ...extra,
  });

  it('keeps only closed weeks, oldest first', () => {
    const now = 10 * WEEK_SECONDS - 1;
    const weeks = parseCompleteWeeks(
      [row(9 * WEEK_SECONDS), row(3 * WEEK_SECONDS), row(2 * WEEK_SECONDS)],
      now
    );
    expect(weeks.map(w => w.t)).toEqual([2 * WEEK_SECONDS, 3 * WEEK_SECONDS]);
  });

  it('keeps the week that closed exactly now', () => {
    expect(parseCompleteWeeks([row(WEEK_SECONDS)], 2 * WEEK_SECONDS)).toHaveLength(1);
  });

  it('keeps a real 0 and marks missing values null', () => {
    const [week] = parseCompleteWeeks(
      [row(0, { fees_platform_usd: null, buyback_total_usd: undefined, buyback_amount: '0' })],
      WEEK_SECONDS
    );
    expect(week).toEqual({
      t: 0,
      yieldUsd: 100.5,
      revenueUsd: null,
      buybackUsd: null,
      buybackAmount: 0,
    });
  });

  it('returns nothing for no rows', () => {
    expect(parseCompleteWeeks([], WEEK_SECONDS)).toEqual([]);
  });
});

describe('sumChainTvl', () => {
  const data = {
    ethereum: [
      [1, 10, 0, 0, 0],
      [2, 20, 0, 0, 0],
    ],
    fantom: [
      [1, 5, 0, 0, 0],
      [2, 5, 0, 0, 0],
      [3, 5, 0, 0, 0],
    ],
    unknown: [[1, 1000, 0, 0, 0]],
  } as Record<string, Array<[number, number, number, number, number]>>;

  it('sums configured chains per timestamp across the union of timestamps', () => {
    expect(sumChainTvl(data, { ethereum: {}, fantom: {} })).toEqual([
      { t: 1, v: 15 },
      { t: 2, v: 25 },
      { t: 3, v: 5 },
    ]);
  });

  it('counts a chain only until its eol', () => {
    expect(sumChainTvl(data, { ethereum: {}, fantom: { eol: 1 } })).toEqual([
      { t: 1, v: 15 },
      { t: 2, v: 20 },
    ]);
  });

  it('drops a whole day when a chain reports an impossible value', () => {
    const broken = {
      ethereum: [[1, 7.39e44, 0, 0, 0] as [number, number, number, number, number]],
    };
    expect(sumChainTvl({ ...data, ...broken }, { ethereum: {}, fantom: {} })).toEqual([
      { t: 2, v: 5 },
      { t: 3, v: 5 },
    ]);
  });

  it('ignores chains missing from config', () => {
    expect(sumChainTvl({ unknown: data.unknown }, { ethereum: {} })).toEqual([]);
  });
});

describe('withMovingAverage', () => {
  it('averages over the whole series and then drops the warm-up points', () => {
    const points = [1, 2, 3, 4].map((v, i) => ({ t: i, v: v * 10 }));
    expect(withMovingAverage(points, 2, 2)).toEqual([
      { t: 2, v: 30, ma: 25 },
      { t: 3, v: 40, ma: 35 },
    ]);
  });
});

describe('changeOverPeriod', () => {
  it('compares the last point with the one a period earlier', () => {
    const points = [0, 1, 2].map(i => ({ t: i * WEEK_SECONDS, v: 100 + i * 10 }));
    expect(changeOverPeriod(points, WEEK_SECONDS)).toBeCloseTo(120 / 110 - 1);
  });

  it('finds the earlier point by timestamp when days are missing', () => {
    const points = [
      { t: 0, v: 100 },
      { t: 5 * DAY, v: 999 },
      { t: 9 * DAY, v: 150 },
    ];
    expect(changeOverPeriod(points, 7 * DAY)).toBeCloseTo(0.5);
  });

  it('is undefined when the gap spans more than a period', () => {
    const points = [
      { t: 0, v: 100 },
      { t: 2 * WEEK_SECONDS, v: 150 },
    ];
    expect(changeOverPeriod(points, WEEK_SECONDS)).toBeUndefined();
  });

  it('is undefined without an earlier point or with a zero base', () => {
    expect(changeOverPeriod([], WEEK_SECONDS)).toBeUndefined();
    expect(changeOverPeriod([{ t: 0, v: 1 }], WEEK_SECONDS)).toBeUndefined();
    expect(
      changeOverPeriod(
        [
          { t: 0, v: 0 },
          { t: WEEK_SECONDS, v: 5 },
        ],
        WEEK_SECONDS
      )
    ).toBeUndefined();
  });
});

describe('weekSeries', () => {
  const week = (t: number): RevenueWeek => ({
    t,
    yieldUsd: 1,
    revenueUsd: 2,
    buybackUsd: 3,
    buybackAmount: 4,
  });
  const weeks = [week(0), week(WEEK_SECONDS)];

  it('picks the metric, in BIFI or USD for buyback', () => {
    expect(weekSeries(weeks, 'revenue', 'usd').map(p => p.v)).toEqual([2, 2]);
    expect(weekSeries(weeks, 'buyback', 'usd').map(p => p.v)).toEqual([3, 3]);
    expect(weekSeries(weeks, 'buyback', 'bifi').map(p => p.v)).toEqual([4, 4]);
  });

  it('skips weeks with no value for the metric', () => {
    const missing = { ...week(0), revenueUsd: null };
    expect(weekSeries([missing, week(WEEK_SECONDS)], 'revenue', 'usd')).toEqual([
      { t: WEEK_SECONDS, v: 2 },
    ]);
    expect(weekSeries([missing, week(WEEK_SECONDS)], 'yield', 'usd')).toHaveLength(2);
  });
});
