import BigNumber from 'bignumber.js';
import { fromUnixTime, isAfter, isBefore, isEqual, max, subDays } from 'date-fns';
import { sortBy } from 'lodash-es';
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
  remainingShares?: number;
  remainingToken0?: number;
  remainingToken1?: number;
  currentShareToUsd?: number;
  currentToken0ToUsd?: number;
  currentToken1ToUsd?: number;
};

class ClmInvestorTimeSeriesGenerator {
  protected readonly pnl: ClmPnl;
  protected readonly series: ClmInvestorOverviewTimeSeriesPoint[] = [];
  protected readonly lastTimelineIdx: number;
  protected readonly lastHistoricalShareToUsdIdx: number;
  protected readonly lastHistoricalUnderlying0ToUsdIdx: number;
  protected readonly lastHistoricalUnderlying1ToUsdIdx: number;
  protected readonly bucketFirstTime: Date;
  protected remainingShares: BigNumber;
  protected remainingToken0: BigNumber;
  protected remainingToken1: BigNumber;
  protected currentShareToUsd: BigNumber;
  protected currentToken0ToUsd: BigNumber;
  protected currentToken1ToUsd: BigNumber;
  protected currentTime: Date;
  protected bucketTime: Date;
  protected timelineIdx: number = 0;
  protected historicalShareToUsdIdx: number = 0;
  protected historicalUnderlying0ToUsdIdx: number = 0;
  protected historicalUnderlying1ToUsdIdx: number = 0;

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
    protected firstDate: Date,
    protected lastDate: Date,
    protected bucketSizeMs: number
  ) {
    this.pnl = new ClmPnl();
    this.bucketFirstTime = this.bucketTime = new Date(
      Math.floor(firstDate.getTime() / bucketSizeMs) * bucketSizeMs
    );
    this.lastTimelineIdx = timeline.length - 1;
    this.lastHistoricalShareToUsdIdx = historicalShareToUsd.length - 1;
    this.lastHistoricalUnderlying0ToUsdIdx = historicalUnderlying0ToUsd.length - 1;
    this.lastHistoricalUnderlying1ToUsdIdx = historicalUnderlying1ToUsd.length - 1;
    this.generate();
  }

  protected processTransaction(tx: CLMTimelineAnalyticsEntry) {
    this.pnl.addTransaction({
      shares: tx.shareDiff,
      token0ToUsd: tx.token0ToUsd,
      token1ToUsd: tx.token1ToUsd,
      token0Amount: tx.underlying0Diff,
      token1Amount: tx.underlying1Diff,
    });

    const { remainingToken0, remainingToken1, remainingShares } = this.pnl.getRemainingShares();
    const { token0ToUsd, token1ToUsd, usdDiff, shareDiff } = tx;
    const shareToUsd = usdDiff.dividedBy(shareDiff);

    this.remainingShares = remainingShares;
    this.remainingToken0 = remainingToken0;
    this.remainingToken1 = remainingToken1;

    this.currentShareToUsd = shareToUsd;
    this.currentToken0ToUsd = token0ToUsd;
    this.currentToken1ToUsd = token1ToUsd;
    this.currentTime = tx.datetime;

    if (this.currentTime.getTime() >= this.bucketFirstTime.getTime()) {
      this.addPoint();
    }
  }

  protected advanceIndexesAndProcessTransactions() {
    this.historicalShareToUsdIdx = advanceIndexIfNeeded(
      this.historicalShareToUsd,
      p => fromUnixTime(p.t),
      this.historicalShareToUsdIdx,
      this.bucketTime
    );

    this.historicalUnderlying0ToUsdIdx = advanceIndexIfNeeded(
      this.historicalUnderlying0ToUsd,
      p => fromUnixTime(p.t),
      this.historicalUnderlying0ToUsdIdx,
      this.bucketTime
    );

    this.historicalUnderlying1ToUsdIdx = advanceIndexIfNeeded(
      this.historicalUnderlying1ToUsd,
      p => fromUnixTime(p.t),
      this.historicalUnderlying1ToUsdIdx,
      this.bucketTime
    );

    this.timelineIdx = advanceIndexIfNeeded(
      this.timeline,
      'datetime',
      this.timelineIdx,
      this.bucketTime,
      nextIdx => {
        this.processTransaction(this.timeline[nextIdx]);
      }
    );
  }

  protected addPoint() {
    const sharesUsd = this.remainingShares.times(this.currentShareToUsd);
    const heldUsd = this.remainingToken0
      .times(this.currentToken0ToUsd)
      .plus(this.remainingToken1.times(this.currentToken1ToUsd));

    this.series.push({
      t: this.currentTime.getTime(),
      v: sharesUsd.toNumber(),
      vHold: heldUsd.toNumber(),
      remainingShares: this.remainingShares.toNumber(),
      remainingToken0: this.remainingToken0.toNumber(),
      remainingToken1: this.remainingToken1.toNumber(),
      currentShareToUsd: this.currentShareToUsd.toNumber(),
      currentToken0ToUsd: this.currentToken0ToUsd.toNumber(),
      currentToken1ToUsd: this.currentToken1ToUsd.toNumber(),
    });
  }

  protected nextBucket() {
    this.bucketTime = new Date(this.bucketTime.getTime() + this.bucketSizeMs);
    this.advanceIndexesAndProcessTransactions();

    if (this.currentTime.getTime() < this.bucketTime.getTime()) {
      this.currentTime = this.bucketTime;
      this.currentShareToUsd = new BigNumber(
        this.historicalShareToUsd[this.historicalShareToUsdIdx].v
      );
      this.currentToken0ToUsd = new BigNumber(
        this.historicalUnderlying0ToUsd[this.historicalUnderlying0ToUsdIdx].v
      );
      this.currentToken1ToUsd = new BigNumber(
        this.historicalUnderlying1ToUsd[this.historicalUnderlying1ToUsdIdx].v
      );
      this.addPoint();
    }
  }

  protected addLivePoint() {
    this.currentTime = new Date();
    this.currentShareToUsd = this.liveShareToUsd;
    this.currentToken0ToUsd = this.liveUnderlying0ToUsd;
    this.currentToken1ToUsd = this.liveUnderlying1ToUsd;
    this.addPoint();
  }

  protected generate() {
    // adds first tx to PNL and generates first point if after bucketFirstTime
    this.processTransaction(this.timeline[0]);
    // move all indexes to the first entries before bucketFirstTime, processing each tx as we go
    this.advanceIndexesAndProcessTransactions();

    // generate points for each bucket
    do {
      this.nextBucket();
    } while (isAfter(this.lastDate, this.bucketTime));

    // process any remaining timeline txs
    while (this.timelineIdx < this.lastTimelineIdx) {
      this.processTransaction(this.timeline[++this.timelineIdx]);
    }

    // add last point with current balances
    this.addLivePoint();

    return this.series;
  }

  public get(): ClmInvestorOverviewTimeSeriesPoint[] {
    return this.series;
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

  return generator.get();
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
