import BigNumber from 'bignumber.js';
import { fromUnixTime, getUnixTime, isAfter, isBefore, isEqual, max, subDays } from 'date-fns';
import { sortBy, sortedUniq } from 'lodash-es';
import type { ApiProductPriceRow } from '../features/data/apis/analytics/analytics-types';
import type {
  CLMTimelineAnalyticsEntry,
  VaultTimelineAnalyticsEntry,
} from '../features/data/entities/analytics';
import { BIG_ZERO } from './big-number';
import { roundDownMinutes } from './date';
import { samplingPeriodMs } from './sampling-period';
import { graphTimeBucketToSamplingPeriod } from './time-bucket';
import type { ClmHarvestsTimeline } from '../features/data/actions/analytics';
import type { ApiPoint } from '../features/data/apis/beefy/beefy-data-api-types';
import { ClmPnl } from './pnl';
import type { GraphBucket } from './graph';

// simulate a join between the 3 price series locally
export interface PriceTsRow {
  datetime: number;
  shareBalance: number | null;
  underlyingBalance: number | null;
  usdBalance: number | null;
}

function sortAndFixPrices(
  prices: ApiProductPriceRow[],
  currentPrice: BigNumber
): ApiProductPriceRow[] {
  const oneDayAgo = subDays(new Date(), 1);

  return sortBy(prices, 'date').map(
    ({ date, value }): ApiProductPriceRow => ({
      date,
      value: value ?? (isBefore(date, oneDayAgo) ? BIG_ZERO : currentPrice),
    })
  );
}

export function getInvestorTimeserie(
  timeBucket: GraphBucket,
  timeline: VaultTimelineAnalyticsEntry[],
  sharesToUnderlying: ApiProductPriceRow[],
  underlyingToUsd: ApiPoint[],
  firstDate: Date,
  currentPpfs: BigNumber,
  currentPrice: BigNumber,
  currentShareBalance: BigNumber
): PriceTsRow[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    graphTimeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];

  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const firstDate1 = new Date(lastDate.getTime() - timeRange);

  const fixedDate = max([firstDate, firstDate1]);

  // Use the current price to fill in any missing prices in the past 24 hours (otherwise set to 0)
  const sortedSharesToUnderlying = sortAndFixPrices(sharesToUnderlying, currentPpfs);
  const sortedUnderlyingToUsd =
    underlyingToUsd; /*sortAndFixPrices(underlyingToUsd, currentPrice);*/

  let balanceIdx = 0;
  let sharesIdx = 0;
  let harvestIdx = 0;
  let currentDate = fixedDate;

  const pricesTs: PriceTsRow[] = [];

  //We should be adding precise initial ppfs and price as first data point
  if (isEqual(timeline[0].datetime, fixedDate)) {
    pricesTs.push({
      datetime: roundDownMinutes(timeline[0].datetime).getTime(),
      shareBalance: timeline[0].shareBalance.toNumber(),
      underlyingBalance: timeline[0].shareBalance
        .times(timeline[0].shareToUnderlyingPrice)
        .toNumber(),
      usdBalance: timeline[0].shareBalance
        .times(
          timeline[0].shareToUnderlyingPrice.times(timeline[0].underlyingToUsdPrice || BIG_ZERO)
        )
        .toNumber(),
    });
    currentDate = new Date(currentDate.getTime() + bucketSize);
  }

  // Need at least one row in each series to work from
  if (sortedSharesToUnderlying.length && sortedUnderlyingToUsd.length) {
    while (currentDate.getTime() <= lastDate.getTime()) {
      // add a row for each date
      // find the corresponding balance row
      balanceIdx = advanceIndexIfNeeded(timeline, 'datetime', balanceIdx, currentDate);
      // find the corresponding shares row
      sharesIdx = advanceIndexIfNeeded(sortedSharesToUnderlying, 'date', sharesIdx, currentDate);
      // find the corresponding underlying row
      harvestIdx = advanceIndexIfNeeded(
        sortedUnderlyingToUsd,
        p => fromUnixTime(p.t),
        harvestIdx,
        currentDate
      );

      // now we have the correct rows for this date
      const shareBalance = timeline[balanceIdx].shareBalance;
      if (shareBalance && !shareBalance.isEqualTo(BIG_ZERO)) {
        // Shares to underlying
        const shares = sortedSharesToUnderlying[sharesIdx];
        const underlyingBalance = shareBalance.times(shares.value);
        // Underlying to usd
        const underlying = sortedUnderlyingToUsd[harvestIdx];
        const usdBalance = underlyingBalance.times(underlying.v);

        pricesTs.push({
          //return date on seconds
          datetime: currentDate.getTime(),
          shareBalance: shareBalance.toNumber(),
          underlyingBalance: underlyingBalance.toNumber(),
          usdBalance: usdBalance.toNumber(),
        });
      }

      currentDate = new Date(currentDate.getTime() + bucketSize);
    }
  }

  pricesTs.push({
    //round down our to the last hours, since first item of the api do the same
    datetime: roundDownMinutes(new Date()).getTime(),
    shareBalance: currentShareBalance.toNumber(),
    underlyingBalance: currentShareBalance.times(currentPpfs).toNumber(),
    usdBalance: currentShareBalance.times(currentPpfs).times(currentPrice).toNumber(),
  });

  return pricesTs;
}

/**
 * Advance the index of an array of data to the next item that is after the current date.
 * The key or key function must return a Date or *millisecond* timestamp
 */
function advanceIndexIfNeeded<T extends string, U extends { [key in T]: Date | number }>(
  data: U[],
  key: T | ((item: U) => Date | number),
  idx: number,
  currentDate: Date,
  onNext?: (idx: number) => void
): number {
  const lastIdx = data.length - 1;
  const keyFn = typeof key === 'function' ? key : (item: U) => item[key];
  while (idx < lastIdx && isAfter(currentDate, keyFn(data[idx + 1]))) {
    ++idx;
    if (onNext) {
      onNext(idx);
    }
  }
  return idx;
}

export type ClmInvestorOverviewTimeSeriesPoint = {
  t: number;
  v: number;
  vHold: number;
  remainingShares: BigNumber;
  remainingToken0: BigNumber;
  remainingToken1: BigNumber;
  shareToUsd: BigNumber;
  token0ToUsd: BigNumber;
  token1ToUsd: BigNumber;
  sharesUsd: BigNumber;
  underlying0Usd: BigNumber;
  underlying1Usd: BigNumber;
};

type TimeValuePoint<TValue> = {
  /** unix timestamp in seconds */
  t: number;
  /** value at timestamp */
  v: TValue;
};

class TimeValueAfter<TValue> {
  protected readonly points: TimeValuePoint<TValue>[];
  protected index: number;
  protected lastIndex: number;

  constructor(unsortedPoints: TimeValuePoint<TValue>[], protected defaultValue: TValue) {
    this.points = sortBy(unsortedPoints, p => p.t);
    this.index = 0;
    this.lastIndex = this.points.length - 1;
  }

  public get timestamps(): number[] {
    return this.points.map(p => p.t);
  }

  public getValueAfter(timestamp: number): TValue {
    while (this.index < this.lastIndex && this.points[this.index + 1].t <= timestamp) {
      ++this.index;
    }

    const after = this.points[this.index];

    if (timestamp < after.t) {
      console.debug(
        'TimeValueAfter requested timestamp is before all values, returning defaultValue',
        timestamp,
        after.t,
        after.v
      );
      return this.defaultValue;
    }

    return after.v;
  }
}

abstract class TimeValueInterpolator<TValue> {
  protected readonly points: TimeValuePoint<TValue>[];
  protected index: number;
  protected lastIndex: number;

  constructor(unsortedPoints: TimeValuePoint<TValue>[]) {
    this.points = sortBy(unsortedPoints, p => p.t);
    this.index = 0;
    this.lastIndex = this.points.length - 1;
  }

  public getValueAt(timestamp: number): TValue {
    while (this.index < this.lastIndex && this.points[this.index + 1].t <= timestamp) {
      ++this.index;
    }

    const after = this.points[this.index];

    // if exact, return value
    if (timestamp === after.t) {
      return after.v;
    }

    if (timestamp > after.t) {
      console.debug(
        'TimeValueInterpolator requested timestamp is after the last value',
        timestamp,
        after.t,
        after.v
      );
      return after.v;
    }

    if (timestamp < after.t && this.index === this.lastIndex) {
      console.debug(
        'TimeValueInterpolator requested timestamp is before all values',
        timestamp,
        after.t,
        after.v
      );
      return after.v;
    }

    // need two points to interpolate
    if (this.index === 0) {
      return after.v;
    }

    const before = this.points[this.index - 1];

    // if exact, return value
    if (timestamp === before.t) {
      return before.v;
    }

    return this.interpolate(timestamp, before.t, after.t, before.v, after.v);
  }

  protected interpolate(t: number, t0: number, t1: number, v0: TValue, v1: TValue): TValue {
    const r0 = t1 - t;
    const r1 = t - t0;
    const d = t1 - t0;
    return this.div(this.add(this.mul(v0, r0), this.mul(v1, r1)), d);
  }

  protected abstract mul(value: TValue, by: number): TValue;

  protected abstract div(value: TValue, by: number): TValue;

  protected abstract add(value: TValue, by: TValue): TValue;
}

class TimeBigNumberInterpolator extends TimeValueInterpolator<BigNumber> {
  protected mul(value: BigNumber, by: number): BigNumber {
    return value.times(by);
  }

  protected div(value: BigNumber, by: number): BigNumber {
    return value.div(by);
  }

  protected add(value: BigNumber, by: BigNumber): BigNumber {
    return value.plus(by);
  }
}

class ClmInvestorTimeSeriesGenerator {
  protected readonly nowUnix = getUnixTime(new Date());
  protected readonly firstUnix: number;
  protected readonly lastUnix: number;
  protected readonly bucketSize: number;
  protected readonly bucketBeforeFirstUnix: number;

  constructor(
    protected timeline: CLMTimelineAnalyticsEntry[],
    protected historicalShareToUsd: ApiPoint[],
    protected historicalUnderlying0ToUsd: ApiPoint[],
    protected historicalUnderlying1ToUsd: ApiPoint[],
    protected liveShareToUsd: BigNumber,
    protected liveShareBalance: BigNumber,
    protected liveUnderlying0ToUsd: BigNumber,
    protected liveUnderlying0Balance: BigNumber,
    protected liveUnderlying1ToUsd: BigNumber,
    protected liveUnderlying1Balance: BigNumber,
    firstDate: Date,
    lastDate: Date,
    bucketSizeMs: number
  ) {
    this.firstUnix = getUnixTime(firstDate);
    this.lastUnix = getUnixTime(lastDate);
    this.bucketSize = bucketSizeMs / 1000;
    this.bucketBeforeFirstUnix = Math.floor(this.firstUnix / this.bucketSize) * this.bucketSize;
  }

  protected getShareToUsd(): TimeBigNumberInterpolator {
    return new TimeBigNumberInterpolator(
      [
        {
          t: this.nowUnix,
          v: this.liveShareToUsd,
        },
      ]
        .concat(
          this.timeline.map(tx => ({
            t: getUnixTime(tx.datetime),
            v: tx.usdDiff.dividedBy(tx.shareDiff),
          }))
        )
        .concat(
          this.historicalShareToUsd.map(p => ({
            t: p.t,
            v: new BigNumber(p.v),
          }))
        )
    );
  }

  protected getUnderlying0ToUsd(): TimeBigNumberInterpolator {
    return new TimeBigNumberInterpolator(
      [
        {
          t: this.nowUnix,
          v: this.liveUnderlying0ToUsd,
        },
      ]
        .concat(
          this.timeline.map(tx => ({
            t: getUnixTime(tx.datetime),
            v: tx.token0ToUsd,
          }))
        )
        .concat(
          this.historicalUnderlying0ToUsd.map(p => ({
            t: p.t,
            v: new BigNumber(p.v),
          }))
        )
    );
  }

  protected getUnderlying1ToUsd(): TimeBigNumberInterpolator {
    return new TimeBigNumberInterpolator(
      [
        {
          t: this.nowUnix,
          v: this.liveUnderlying1ToUsd,
        },
      ]
        .concat(
          this.timeline.map(tx => ({
            t: getUnixTime(tx.datetime),
            v: tx.token1ToUsd,
          }))
        )
        .concat(
          this.historicalUnderlying1ToUsd.map(p => ({
            t: p.t,
            v: new BigNumber(p.v),
          }))
        )
    );
  }

  protected getBalances() {
    const sharePoints: TimeValuePoint<BigNumber>[] = [];
    const underlying0Points: TimeValuePoint<BigNumber>[] = [];
    const underlying1Points: TimeValuePoint<BigNumber>[] = [];
    const pnl = new ClmPnl();

    let hadFirstDeposit: boolean = false;
    for (const tx of this.timeline) {
      pnl.addTransaction({
        shares: tx.shareDiff,
        token0ToUsd: tx.token0ToUsd,
        token1ToUsd: tx.token1ToUsd,
        token0Amount: tx.underlying0Diff,
        token1Amount: tx.underlying1Diff,
      });

      const { remainingToken0, remainingToken1, remainingShares } = pnl.getRemainingShares();
      hadFirstDeposit = hadFirstDeposit || remainingShares.gt(BIG_ZERO);
      if (!hadFirstDeposit) {
        continue;
      }

      const txUnix = getUnixTime(tx.datetime);
      if (txUnix < this.bucketBeforeFirstUnix) {
        continue;
      }

      sharePoints.push({
        t: txUnix,
        v: remainingShares,
      });

      underlying0Points.push({
        t: txUnix,
        v: remainingToken0,
      });

      underlying1Points.push({
        t: txUnix,
        v: remainingToken1,
      });
    }

    return {
      shareBalance: new TimeValueAfter(sharePoints, BIG_ZERO),
      underlying0Balance: new TimeValueAfter(underlying0Points, BIG_ZERO),
      underlying1Balance: new TimeValueAfter(underlying1Points, BIG_ZERO),
    };
  }

  protected getTimestamps(txTimestamps: number[]) {
    const timestamps: number[] = [...txTimestamps];
    const firstTxTimeStamp = txTimestamps[0];

    for (let t = this.bucketBeforeFirstUnix; t <= this.lastUnix; t += this.bucketSize) {
      if (t > firstTxTimeStamp) {
        timestamps.push(t);
      }
    }

    timestamps.push(this.nowUnix);

    return sortedUniq(timestamps.sort((a, b) => a - b));
  }

  public generate(): ClmInvestorOverviewTimeSeriesPoint[] {
    const shareToUsd = this.getShareToUsd();
    const underlying0ToUsd = this.getUnderlying0ToUsd();
    const underlying1ToUsd = this.getUnderlying1ToUsd();
    const { shareBalance, underlying0Balance, underlying1Balance } = this.getBalances();
    const timestamps = this.getTimestamps(shareBalance.timestamps);

    return timestamps.map(t => {
      const shares = shareBalance.getValueAfter(t);
      const underlying0 = underlying0Balance.getValueAfter(t);
      const underlying1 = underlying1Balance.getValueAfter(t);
      const sharePrice = shareToUsd.getValueAt(t);
      const underlying0Price = underlying0ToUsd.getValueAt(t);
      const underlying1Price = underlying1ToUsd.getValueAt(t);

      const sharesUsd = shares.times(sharePrice);
      const underlying0Usd = underlying0.times(underlying0Price);
      const underlying1Usd = underlying1.times(underlying1Price);
      const heldUsd = underlying0Usd.plus(underlying1Usd);

      return {
        t: t * 1000, // graph UI wants timestamp in milliseconds
        v: sharesUsd.toNumber(),
        vHold: heldUsd.toNumber(),
        remainingShares: shares,
        remainingToken0: underlying0,
        remainingToken1: underlying1,
        shareToUsd: sharePrice,
        token0ToUsd: underlying0Price,
        token1ToUsd: underlying1Price,
        sharesUsd: sharesUsd,
        underlying0Usd: underlying0Usd,
        underlying1Usd: underlying1Usd,
      };
    });
  }
}

export function getClmInvestorTimeSeries(
  timeBucket: GraphBucket,
  timeline: CLMTimelineAnalyticsEntry[],
  shareToUsd: ApiPoint[],
  underlying0ToUsd: ApiPoint[],
  underlying1ToUsd: ApiPoint[],
  firstDepositDate: Date,
  currentPrice: BigNumber,
  currentShareBalance: BigNumber,
  token0SharesAtDeposit: BigNumber,
  token1SharesAtDeposit: BigNumber,
  currentPriceToken0: BigNumber,
  currentPriceToken1: BigNumber
): ClmInvestorOverviewTimeSeriesPoint[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    graphTimeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];
  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const rangeStartDate = new Date(lastDate.getTime() - timeRange);
  const firstDate = max([firstDepositDate, rangeStartDate]);

  const generator = new ClmInvestorTimeSeriesGenerator(
    timeline,
    shareToUsd,
    underlying0ToUsd,
    underlying1ToUsd,
    currentPrice,
    currentShareBalance,
    currentPriceToken0,
    token0SharesAtDeposit,
    currentPriceToken1,
    token1SharesAtDeposit,
    firstDate,
    lastDate,
    bucketSize
  );

  return generator.generate();
}

export type ClmInvestorFeesTimeSeriesPoint = {
  t: number;
  v0: number;
  v1: number;
};

export function getClmInvestorFeesTimeSeries(
  timeBucket: GraphBucket,
  timeline: ClmHarvestsTimeline,
  _currentPriceToken0: BigNumber,
  _currentPriceToken1: BigNumber
): ClmInvestorFeesTimeSeriesPoint[] | undefined {
  const { timeRange: timeRangeStr } = graphTimeBucketToSamplingPeriod(timeBucket);
  const timeRange = samplingPeriodMs[timeRangeStr];
  const now = new Date();
  const firstHarvest = timeline.harvests[0];
  const startDate = max([firstHarvest.timestamp, new Date(now.getTime() - timeRange)]);
  const firstHarvestIdx = timeline.harvests.findIndex(h => isAfter(h.timestamp, startDate));
  const lastHarvestIdx = timeline.harvests.length - 1;
  const lastHarvest = timeline.harvests[lastHarvestIdx];
  if (firstHarvestIdx === -1) {
    // no harvests in the requested bucket, return last point so there is at least one point on graph
    return [
      {
        t: lastHarvest.timestamp.getTime(),
        v0: lastHarvest.cumulativeAmountsUsd[0].toNumber(),
        v1: lastHarvest.cumulativeAmountsUsd[1].toNumber(),
      },
    ];
  }
  const harvestsInBucket = timeline.harvests.slice(firstHarvestIdx, lastHarvestIdx + 1);
  const priorHarvest = timeline.harvests[firstHarvestIdx - 1];
  const cumulativeAmountsUsd = priorHarvest
    ? [...priorHarvest.cumulativeAmountsUsd]
    : timeline.tokens.map(() => BIG_ZERO);

  return harvestsInBucket.map(harvest => {
    harvest.amountsUsd.forEach((amount, i) => {
      cumulativeAmountsUsd[i] = cumulativeAmountsUsd[i].plus(amount);
    });
    return {
      t: harvest.timestamp.getTime(),
      v0: cumulativeAmountsUsd[0].toNumber(),
      v1: cumulativeAmountsUsd[1].toNumber(),
    };
  });
}
