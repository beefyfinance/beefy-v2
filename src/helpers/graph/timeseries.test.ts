import { describe, expect, it } from 'vitest';
import {
  type ClmInvestorOverviewTimeSeriesPoint,
  mergeClmOverviewTimeSeries,
} from './timeseries.ts';

function point(
  timestamp: number,
  underlying: number,
  underlyingUsd: number,
  heldUsd: number
): ClmInvestorOverviewTimeSeriesPoint {
  return {
    timestamp,
    shares: underlying,
    underlying,
    underlyingUsd,
    heldUsd,
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
