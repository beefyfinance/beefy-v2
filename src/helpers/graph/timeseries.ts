import BigNumber from 'bignumber.js';
import { fromUnixTime, getUnixTime, isAfter, isBefore, isEqual, max, subDays } from 'date-fns';
import { pick, sortBy, sortedUniq } from 'lodash-es';
import type { DatabarnProductPriceRow } from '../../features/data/apis/databarn/databarn-types.ts';
import {
  type TimelineEntryCowcentratedPool,
  type TimelineEntryCowcentratedVault,
  type TimelineEntryStandard,
} from '../../features/data/entities/analytics.ts';
import { BIG_ONE, BIG_ZERO } from '../big-number.ts';
import { roundDownMinutes } from '../date.ts';
import { samplingPeriodMs } from '../sampling-period.ts';
import type {
  ClmUserHarvestsTimeline,
  ClmUserHarvestsTimelineHarvest,
} from '../../features/data/actions/analytics.ts';
import type { ApiPoint } from '../../features/data/apis/beefy/beefy-data-api-types.ts';
import { ClmPnl } from '../pnl.ts';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import { getBigNumberInterpolator, type Interpolator } from '../math.ts';
import type { GraphBucket } from './types.ts';
import { graphTimeBucketToSamplingPeriod } from './graph.ts';
import type {
  ClmPriceHistoryEntryClassic,
  ClmPriceHistoryEntryClm,
} from '../../features/data/apis/clm/clm-api-types.ts';

// simulate a join between the 3 price series locally
export interface PriceTsRow {
  datetime: number;
  shareBalance: number | null;
  underlyingBalance: number | null;
  usdBalance: number | null;
}

function sortAndFixPrices(
  prices: DatabarnProductPriceRow[],
  currentPrice: BigNumber
): DatabarnProductPriceRow[] {
  const oneDayAgo = subDays(new Date(), 1);

  return sortBy(prices, 'date').map(
    ({ date, value }): DatabarnProductPriceRow => ({
      date,
      value: value ?? (isBefore(date, oneDayAgo) ? BIG_ZERO : currentPrice),
    })
  );
}

export function getInvestorTimeseries(
  timeBucket: GraphBucket,
  timeline: TimelineEntryStandard[],
  sharesToUnderlying: DatabarnProductPriceRow[],
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
function advanceIndexIfNeeded<
  T extends string,
  U extends {
    [key in T]: Date | number;
  },
>(
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
  timestamp: number;
  shares: number;
  underlying: number;
  underlyingUsd: number;
  heldUsd: number;
  debug: {
    sharesToUnderlying: BigNumber;
    underlyingToToken0: BigNumber;
    underlyingToToken1: BigNumber;
    underlyingToUsd: BigNumber;
    token0ToUsd: BigNumber;
    token1ToUsd: BigNumber;
    sharesAtDeposit: BigNumber;
    underlying: BigNumber;
    token0: BigNumber;
    token1: BigNumber;
    underlyingUsd: BigNumber;
    token0Usd: BigNumber;
    token1Usd: BigNumber;
    token0AtDeposit: BigNumber;
    token1AtDeposit: BigNumber;
    token0AtDepositUsd: BigNumber;
    token1AtDepositUsd: BigNumber;
    heldUsd: BigNumber;
  };
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

  constructor(
    unsortedPoints: TimeValuePoint<TValue>[],
    protected defaultValue: TValue
  ) {
    this.points = sortBy(unsortedPoints, p => p.t);
    this.index = 0;
    this.lastIndex = this.points.length - 1;
  }

  public get timestamps(): number[] {
    return this.points.map(p => p.t);
  }

  public getValueAfter(timestamp: number): TValue {
    if (this.lastIndex === -1) {
      console.debug('TimeValueAfter has no entries, returning defaultValue', timestamp);
      return this.defaultValue;
    }

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

  protected constructor(
    unsortedPoints: TimeValuePoint<TValue>[],
    protected interpolator: Interpolator<TValue>
  ) {
    if (unsortedPoints.length === 0) {
      throw new Error('TimeValueInterpolator needs at least one point');
    }
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

    if (this.index === this.lastIndex) {
      console.debug(
        `TimeValueInterpolator requested timestamp is ${
          timestamp > after.t ? 'after the last value' : 'before all values'
        }`,
        fromUnixTime(timestamp),
        fromUnixTime(after.t),
        this.interpolator.toString(after.v)
      );
      return after.v;
    }

    if (timestamp < after.t && this.index === this.lastIndex) {
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

    return this.interpolator.interpolate(timestamp, before.t, after.t, before.v, after.v);
  }
}

class TimeBigNumberInterpolator extends TimeValueInterpolator<BigNumber> {
  constructor(points: TimeValuePoint<BigNumber>[]) {
    super(points, getBigNumberInterpolator());
  }
}

class ClmInvestorOverviewTimeSeriesGenerator {
  protected readonly nowUnix: number;
  protected readonly firstUnix: number;
  protected readonly lastUnix: number;
  protected readonly bucketSize: number;
  protected readonly bucketBeforeFirstUnix: number;

  constructor(
    protected timeline: Array<TimelineEntryCowcentratedPool | TimelineEntryCowcentratedVault>,
    protected historicalClmData: ClmPriceHistoryEntryClm[],
    protected historicalVaultData: ClmPriceHistoryEntryClassic[] | undefined,
    protected historicalUnderlyingToUsd: ApiPoint[],
    protected historicalUnderlying0ToUsd: ApiPoint[],
    protected historicalUnderlying1ToUsd: ApiPoint[],
    protected liveSharesToUnderlying: BigNumber,
    protected liveSharesBalance: BigNumber,
    protected liveUnderlyingToUsd: BigNumber,
    protected liveUnderlyingBalance: BigNumber,
    protected liveUnderlying0ToUsd: BigNumber,
    protected liveUnderlying0Balance: BigNumber,
    protected liveUnderlying1ToUsd: BigNumber,
    protected liveUnderlying1Balance: BigNumber,
    firstDate: Date,
    lastDate: Date,
    bucketSizeMs: number
  ) {
    this.nowUnix = getUnixTime(new Date());
    this.firstUnix = getUnixTime(firstDate);
    this.lastUnix = Math.min(this.nowUnix, getUnixTime(lastDate));
    this.bucketSize = bucketSizeMs / 1000;
    this.bucketBeforeFirstUnix = Math.floor(this.firstUnix / this.bucketSize) * this.bucketSize;

    if (this.timeline[0]?.type === 'cowcentrated-vault' && this.historicalVaultData === undefined) {
      throw new Error('Historical vault data is required for cowcentrated-vault');
    }
  }

  protected getSharesToUnderlying(): TimeValueAfter<BigNumber> {
    const points: TimeValuePoint<BigNumber>[] = [];

    // only vaults have shares, use 1:1 mapping for clm pools
    if (this.historicalVaultData === undefined) {
      points.push({
        t: Math.min(this.firstUnix, this.bucketBeforeFirstUnix),
        v: BIG_ONE,
      });
    } else {
      points.push({
        t: this.nowUnix,
        v: this.liveSharesToUnderlying,
      });
      points.push(
        ...this.timeline.map(tx => ({
          t: getUnixTime(tx.datetime),
          v: tx.underlyingPerShare,
        }))
      );
      points.push(
        ...this.historicalVaultData.map(p => ({
          t: p.timestamp,
          v:
            p.totalSupply === '0' ?
              BIG_ONE
            : new BigNumber(p.totalUnderlyingAmount).dividedBy(p.totalSupply),
        }))
      );
    }

    return new TimeValueAfter<BigNumber>(points, BIG_ONE);
  }

  // TODO add live data
  protected getUnderlyingToToken(i: 0 | 1): TimeBigNumberInterpolator {
    const points: TimeValuePoint<BigNumber>[] = [
      {
        t: this.nowUnix,
        v: this[`liveUnderlying${i}ToUsd`].dividedBy(this.liveUnderlyingToUsd),
      },
    ]
      .concat(
        this.timeline.map(tx => ({
          t: getUnixTime(tx.datetime),
          v: tx[`underlying${i}PerUnderlying`],
        }))
      )
      .concat(
        this.historicalClmData.map(p => ({
          t: p.timestamp,
          v:
            p.totalSupply === '0' ?
              BIG_ZERO
            : new BigNumber(p[`totalAmount${i}`]).dividedBy(p.totalSupply),
        }))
      );

    if (this.historicalVaultData) {
      points.push(
        ...this.historicalVaultData.map(p => ({
          t: p.timestamp,
          v:
            p.totalUnderlyingSupply === '0' ?
              BIG_ZERO
            : new BigNumber(p.totalUnderlyingBreakdown[i].amount).dividedBy(
                p.totalUnderlyingSupply
              ),
        }))
      );
    }

    return new TimeBigNumberInterpolator(points);
  }

  protected getUnderlyingToUsd(): TimeBigNumberInterpolator {
    return new TimeBigNumberInterpolator(
      [
        {
          t: this.nowUnix,
          v: this.liveUnderlyingToUsd,
        },
      ]
        .concat(
          this.timeline.map(tx => ({
            t: getUnixTime(tx.datetime),
            v: tx.underlyingToUsd,
          }))
        )
        .concat(
          this.historicalUnderlyingToUsd.map(p => ({
            t: p.t,
            v: new BigNumber(p.v),
          }))
        )
    );
  }

  protected getTokenToUsd(i: 0 | 1): TimeBigNumberInterpolator {
    return new TimeBigNumberInterpolator(
      [
        {
          t: this.nowUnix,
          v: this[`liveUnderlying${i}ToUsd`],
        },
      ]
        .concat(
          this.timeline.map(tx => ({
            t: getUnixTime(tx.datetime),
            v: tx[`token${i}ToUsd`],
          }))
        )
        .concat(
          this[`historicalUnderlying${i}ToUsd`].map(p => ({
            t: p.t,
            v: new BigNumber(p.v),
          }))
        )
    );
  }

  protected getBalances() {
    const sharePoints: TimeValuePoint<BigNumber>[] = [];
    const token0Points: TimeValuePoint<BigNumber>[] = [];
    const token1Points: TimeValuePoint<BigNumber>[] = [];
    const balanceTimestamps: number[] = [];
    const pnl = new ClmPnl();

    let hadFirstDeposit: boolean = false;
    for (const tx of this.timeline) {
      pnl.addTransaction({
        shares: tx.shareDiff,
        underlyingToUsd: tx.underlyingToUsd,
        token0ToUsd: tx.token0ToUsd,
        token1ToUsd: tx.token1ToUsd,
        underlyingAmount: tx.underlyingDiff,
        token0Amount: tx.underlying0Diff,
        token1Amount: tx.underlying1Diff,
        claims: [],
      });

      const { remainingShares, remainingToken0, remainingToken1 } = pnl.getRemainingShares();
      hadFirstDeposit = hadFirstDeposit || remainingShares.gt(BIG_ZERO);
      if (!hadFirstDeposit) {
        continue;
      }

      const txUnix = getUnixTime(tx.datetime);
      if (txUnix >= this.bucketBeforeFirstUnix) {
        balanceTimestamps.push(txUnix);
      }

      sharePoints.push({
        t: txUnix,
        v: remainingShares,
      });

      token0Points.push({
        t: txUnix,
        v: remainingToken0,
      });

      token1Points.push({
        t: txUnix,
        v: remainingToken1,
      });
    }

    sharePoints.push({
      t: this.nowUnix,
      v: this.liveSharesBalance,
    });

    return {
      sharesAtDepositBalances: new TimeValueAfter(sharePoints, BIG_ZERO),
      token0AtDepositBalances: new TimeValueAfter(token0Points, BIG_ZERO),
      token1AtDepositBalances: new TimeValueAfter(token1Points, BIG_ZERO),
      balanceTimestamps,
    };
  }

  protected getTimestamps(exactTxTimestamps: number[], firstTxInRangeTimestamp: number) {
    const timestamps: number[] = [...exactTxTimestamps];

    for (let t = this.bucketBeforeFirstUnix; t <= this.lastUnix; t += this.bucketSize) {
      if (t > firstTxInRangeTimestamp) {
        timestamps.push(t);
      }
    }

    timestamps.push(this.nowUnix);

    return sortedUniq(timestamps.sort((a, b) => a - b));
  }

  public generate(): ClmInvestorOverviewTimeSeriesPoint[] {
    const sharesToUnderlyingTVA = this.getSharesToUnderlying();
    const underlyingToToken0Interpolator = this.getUnderlyingToToken(0);
    const underlyingToToken1Interpolator = this.getUnderlyingToToken(1);
    const underlyingToUsdInterpolator = this.getUnderlyingToUsd();
    const token0ToUsdInterpolator = this.getTokenToUsd(0);
    const token1ToUsdInterpolator = this.getTokenToUsd(1);
    const {
      sharesAtDepositBalances,
      token0AtDepositBalances,
      token1AtDepositBalances,
      balanceTimestamps,
    } = this.getBalances();
    const timestamps = this.getTimestamps(balanceTimestamps, sharesAtDepositBalances.timestamps[0]);

    return timestamps.map(t => {
      const sharesAtDeposit = sharesAtDepositBalances.getValueAfter(t);
      const token0AtDeposit = token0AtDepositBalances.getValueAfter(t);
      const token1AtDeposit = token1AtDepositBalances.getValueAfter(t);
      const sharesToUnderlying = sharesToUnderlyingTVA.getValueAfter(t);
      const underlyingToToken0 = underlyingToToken0Interpolator.getValueAt(t);
      const underlyingToToken1 = underlyingToToken1Interpolator.getValueAt(t);

      const underlyingToUsd = underlyingToUsdInterpolator.getValueAt(t);
      const token0ToUsd = token0ToUsdInterpolator.getValueAt(t);
      const token1ToUsd = token1ToUsdInterpolator.getValueAt(t);

      const underlying = sharesAtDeposit.times(sharesToUnderlying);
      const token0 = underlying.times(underlyingToToken0);
      const token1 = underlying.times(underlyingToToken1);
      const underlyingUsd = underlying.times(underlyingToUsd);
      const token0Usd = token0.times(token0ToUsd);
      const token1Usd = token1.times(token1ToUsd);

      const token0AtDepositUsd = token0AtDeposit.times(token0ToUsd);
      const token1AtDepositUsd = token1AtDeposit.times(token1ToUsd);
      const heldUsd = token0AtDepositUsd.plus(token1AtDepositUsd);

      return {
        timestamp: t * 1000, // graph UI wants timestamp in milliseconds
        shares: sharesAtDeposit.toNumber(),
        underlying: underlying.toNumber(),
        underlyingUsd: underlyingUsd.toNumber(),
        heldUsd: heldUsd.toNumber(),
        debug: {
          sharesToUnderlying,
          underlyingToToken0,
          underlyingToToken1,
          underlyingToUsd,
          token0ToUsd,
          token1ToUsd,
          sharesAtDeposit,
          underlying,
          token0,
          token1,
          underlyingUsd,
          token0Usd,
          token1Usd,
          token0AtDeposit,
          token1AtDeposit,
          token0AtDepositUsd,
          token1AtDepositUsd,
          heldUsd,
        },
      };
    });
  }
}

class ClmInvestorFeesTimeSeriesGenerator {
  protected readonly nowUnix: number;
  protected readonly firstUnix: number;
  protected readonly lastUnix: number;
  protected readonly bucketSize: number;
  protected readonly bucketBeforeFirstUnix: number;

  constructor(
    protected timeline: ClmUserHarvestsTimelineHarvest[],
    protected tokens: TokenEntity[],
    firstDate: Date,
    lastDate: Date,
    bucketSizeMs: number
  ) {
    this.nowUnix = getUnixTime(new Date());
    this.firstUnix = getUnixTime(firstDate);
    this.lastUnix = Math.min(this.nowUnix, getUnixTime(lastDate));
    this.bucketSize = bucketSizeMs / 1000;
    this.bucketBeforeFirstUnix = Math.floor(this.firstUnix / this.bucketSize) * this.bucketSize;
  }

  protected getCumulative() {
    return new TimeValueAfter(
      this.timeline.map(h => {
        return {
          t: getUnixTime(h.timestamp),
          v: pick(h, ['cumulativeAmountsUsd', 'cumulativeAmounts']),
        };
      }),
      {
        cumulativeAmountsUsd: this.tokens.map(() => BIG_ZERO),
        cumulativeAmounts: this.tokens.map(() => BIG_ZERO),
      }
    );
  }

  protected getTimestamps(txTimestamps: number[]) {
    const timestamps: number[] = [...txTimestamps].filter(t => t >= this.bucketBeforeFirstUnix);
    const firstTxTimeStamp = txTimestamps[0];

    for (let t = this.bucketBeforeFirstUnix; t <= this.lastUnix; t += this.bucketSize) {
      if (t > firstTxTimeStamp) {
        timestamps.push(t);
      }
    }

    timestamps.push(this.nowUnix);

    return sortedUniq(timestamps.sort((a, b) => a - b));
  }

  public generate(): ClmInvestorFeesTimeSeriesPoint[] {
    const cumulative = this.getCumulative();
    const timestamps = this.getTimestamps(cumulative.timestamps);

    return timestamps.map(t => {
      const { cumulativeAmounts, cumulativeAmountsUsd } = cumulative.getValueAfter(t);

      return {
        t: t * 1000, // graph UI wants timestamp in milliseconds
        amounts: cumulativeAmounts,
        values: cumulativeAmountsUsd.map(v => v.toNumber()),
      };
    });
  }
}

export function getClmInvestorTimeSeries(
  timeBucket: GraphBucket,
  timeline: TimelineEntryCowcentratedPool[] | TimelineEntryCowcentratedVault[],
  underlyingToUsd: ApiPoint[],
  underlying0ToUsd: ApiPoint[],
  underlying1ToUsd: ApiPoint[],
  firstDepositDate: Date,
  nowBalanceShares: BigNumber,
  nowBalanceUnderlying: BigNumber,
  nowBalanceToken0: BigNumber,
  nowBalanceToken1: BigNumber,
  nowPricePerFullShare: BigNumber,
  nowPriceUnderlying: BigNumber,
  nowPriceToken0: BigNumber,
  nowPriceToken1: BigNumber,
  clmHistory: ClmPriceHistoryEntryClm[],
  vaultHistory: ClmPriceHistoryEntryClassic[] | undefined
): ClmInvestorOverviewTimeSeriesPoint[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    graphTimeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];
  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const rangeStartDate = new Date(lastDate.getTime() - timeRange);
  const firstDate = max([firstDepositDate, rangeStartDate]);

  const generator = new ClmInvestorOverviewTimeSeriesGenerator(
    timeline,
    clmHistory,
    vaultHistory,
    underlyingToUsd,
    underlying0ToUsd,
    underlying1ToUsd,
    nowPricePerFullShare,
    nowBalanceShares,
    nowPriceUnderlying,
    nowBalanceUnderlying,
    nowPriceToken0,
    nowBalanceToken0,
    nowPriceToken1,
    nowBalanceToken1,
    firstDate,
    lastDate,
    bucketSize
  );

  return generator.generate();
}

export type ClmInvestorFeesTimeSeriesPoint = {
  t: number;
  /** cumulative usd per token */
  values: number[];
  /** cumulative amount per token */
  amounts: BigNumber[];
};

export function getClmInvestorFeesTimeSeries(
  timeBucket: GraphBucket,
  timeline: ClmUserHarvestsTimeline,
  firstDepositDate: Date
): ClmInvestorFeesTimeSeriesPoint[] | undefined {
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    graphTimeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];
  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const rangeStartDate = new Date(lastDate.getTime() - timeRange);
  const firstDate = max([firstDepositDate, rangeStartDate]);
  const generator = new ClmInvestorFeesTimeSeriesGenerator(
    timeline.harvests,
    timeline.tokens,
    firstDate,
    lastDate,
    bucketSize
  );
  return generator.generate();
}
