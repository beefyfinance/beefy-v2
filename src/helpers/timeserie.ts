import type BigNumber from 'bignumber.js';
import { isAfter, isBefore, isEqual, max, subDays } from 'date-fns';
import { sortBy } from 'lodash-es';
import type {
  ApiProductPriceRow,
  TimeBucketType,
} from '../features/data/apis/analytics/analytics-types';
import type {
  CLMTimelineAnalyticsEntity,
  VaultTimelineAnalyticsEntity,
} from '../features/data/entities/analytics';
import { BIG_ZERO } from './big-number';
import { roundDownMinutes } from './date';
import { samplingPeriodMs } from './sampling-period';
import { timeBucketToSamplingPeriod } from './time-bucket';
import type { Harvest } from '../features/data/reducers/clm-harvests';

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
  timeBucket: TimeBucketType,
  timeline: VaultTimelineAnalyticsEntity[],
  sharesToUnderlying: ApiProductPriceRow[],
  underlyingToUsd: ApiProductPriceRow[],
  firstDate: Date,
  currentPpfs: BigNumber,
  currentPrice: BigNumber,
  currentShareBalance: BigNumber
): PriceTsRow[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    timeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];

  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const firstDate1 = new Date(lastDate.getTime() - timeRange);

  const fixedDate = max([firstDate, firstDate1]);

  // Use the current price to fill in any missing prices in the past 24 hours (otherwise set to 0)
  const sortedSharesToUnderlying = sortAndFixPrices(sharesToUnderlying, currentPpfs);
  const sortedUnderlyingToUsd = sortAndFixPrices(underlyingToUsd, currentPrice);

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
    while (currentDate <= lastDate) {
      // add a row for each date
      // find the corresponding balance row
      while (
        balanceIdx < timeline.length - 1 &&
        isAfter(currentDate, timeline[balanceIdx + 1].datetime)
      ) {
        balanceIdx++;
      }
      // find the corresponding shares row
      while (
        sharesIdx < sortedSharesToUnderlying.length - 1 &&
        isAfter(currentDate, sortedSharesToUnderlying[sharesIdx + 1].date)
      ) {
        sharesIdx++;
      }
      // find the corresponding underlying row
      while (
        harvestIdx < sortedUnderlyingToUsd.length - 1 &&
        isAfter(currentDate, sortedUnderlyingToUsd[harvestIdx + 1].date)
      ) {
        harvestIdx++;
      }

      // now we have the correct rows for this date
      const shareBalance = timeline[balanceIdx].shareBalance;
      if (shareBalance && !shareBalance.isEqualTo(BIG_ZERO)) {
        // Shares to underlying
        const shares = sortedSharesToUnderlying[sharesIdx];
        const underlyingBalance = shareBalance.times(shares.value);
        // Underlying to usd
        const underlying = sortedUnderlyingToUsd[harvestIdx];
        const usdBalance = underlyingBalance.times(underlying.value);

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

export function getClmInvestorTimeserie(
  timeBucket: TimeBucketType,
  timeline: CLMTimelineAnalyticsEntity[],
  underlyingToUsd: ApiProductPriceRow[],
  firstDate: Date,
  currentPrice: BigNumber,
  currentShareBalance: BigNumber
): { t: number; v: number }[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    timeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];

  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const firstDate1 = new Date(lastDate.getTime() - timeRange);

  const fixedDate = max([firstDate, firstDate1]);

  // Use the current price to fill in any missing prices in the past 24 hours (otherwise set to 0)

  const sortedUnderlyingToUsd = sortAndFixPrices(underlyingToUsd, currentPrice);

  let balanceIdx = 0;
  let harvestIdx = 0;
  let currentDate = fixedDate;

  const pricesTs: { t: number; v: number }[] = [];

  //We should be adding precise initial ppfs and price as first data point
  if (isEqual(timeline[0].datetime, fixedDate)) {
    const { underlying0Diff, underlying1Diff, token1ToUsd, token0ToUsd } = timeline[0];

    const priceAtDeposit = underlying0Diff
      .times(token0ToUsd)
      .plus(underlying1Diff.times(token1ToUsd));

    pricesTs.push({
      t: roundDownMinutes(timeline[0].datetime).getTime(),
      v: priceAtDeposit.toNumber(),
    });
    currentDate = new Date(currentDate.getTime() + bucketSize);
  }

  // Need at least one row in each series to work from
  if (sortedUnderlyingToUsd.length) {
    while (currentDate <= lastDate) {
      // add a row for each date
      // find the corresponding balance row
      while (
        balanceIdx < timeline.length - 1 &&
        isAfter(currentDate, timeline[balanceIdx + 1].datetime)
      ) {
        balanceIdx++;
      }

      // find the corresponding underlying row
      while (
        harvestIdx < sortedUnderlyingToUsd.length - 1 &&
        isAfter(currentDate, sortedUnderlyingToUsd[harvestIdx + 1].date)
      ) {
        harvestIdx++;
      }

      // now we have the correct rows for this date
      const shareBalance = timeline[balanceIdx].shareBalance;
      if (shareBalance && !shareBalance.isEqualTo(BIG_ZERO)) {
        // Underlying to usd
        const underlying = sortedUnderlyingToUsd[harvestIdx];
        const usdBalance = timeline[balanceIdx].shareBalance.times(underlying.value);

        pricesTs.push({
          //return date on seconds
          t: currentDate.getTime(),
          v: usdBalance.toNumber(),
        });
      }

      currentDate = new Date(currentDate.getTime() + bucketSize);
    }
  }

  pricesTs.push({
    //round down our to the last hours, since first item of the api do the same
    t: roundDownMinutes(new Date()).getTime(),
    v: currentShareBalance.times(currentPrice).toNumber(),
  });

  return pricesTs;
}

export function getClmInvestorFeesTimeserie(
  timeBucket: TimeBucketType,
  timeline: CLMTimelineAnalyticsEntity[],
  harvests: Harvest[],
  firstDate: Date,
  currentPriceToken0: BigNumber,
  currentPriceToken1: BigNumber
): { t: number; v0: number; v1: number }[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    timeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];

  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const firstDate1 = new Date(lastDate.getTime() - timeRange);

  const fixedDate = max([firstDate, firstDate1]);

  const oneDayAgo = subDays(new Date(), 1);

  // Use the current price to fill in any missing prices in the past 24 hours (otherwise set to 0)
  const sortedHarvests = sortBy(harvests, 'date').map(
    ({ date, token0ToUsd, token1ToUsd, ...rest }): Harvest => ({
      ...rest,
      date,
      token0ToUsd: token0ToUsd ?? (isBefore(date, oneDayAgo) ? BIG_ZERO : currentPriceToken0),
      token1ToUsd: token1ToUsd ?? (isBefore(date, oneDayAgo) ? BIG_ZERO : currentPriceToken1),
    })
  );

  let balanceIdx = 0;
  let harvestIdx = 0;
  let currentDate = fixedDate;
  let culmutativeFees0 = BIG_ZERO;
  let culmutativeFees1 = BIG_ZERO;

  const pricesTs: { t: number; v0: number; v1: number }[] = [];

  //We should be adding precise initial ppfs and price as first data point
  if (isEqual(timeline[0].datetime, fixedDate)) {
    const { shareBalance, token1ToUsd, token0ToUsd } = timeline[0];

    const { totalSupply, compoundedAmount0, compoundedAmount1 } = sortedHarvests[harvestIdx];

    const token0HarvestedRewardsToUsd = shareBalance
      .dividedBy(totalSupply)
      .times(compoundedAmount0)
      .times(token0ToUsd);

    const token1HarvestedRewardsToUsd = culmutativeFees1.plus(
      shareBalance.dividedBy(totalSupply).times(compoundedAmount1).times(token1ToUsd)
    );

    pricesTs.push({
      //return date on seconds
      t: roundDownMinutes(timeline[0].datetime).getTime(),
      v0: token0HarvestedRewardsToUsd.toNumber(),
      v1: token1HarvestedRewardsToUsd.toNumber(),
    });

    culmutativeFees0 = token0HarvestedRewardsToUsd;
    culmutativeFees1 = token1HarvestedRewardsToUsd;

    currentDate = new Date(currentDate.getTime() + bucketSize);
  }

  // Need at least one row in each series to work from
  if (sortedHarvests.length) {
    while (currentDate <= lastDate) {
      // add a row for each date
      // find the corresponding balance row
      while (
        balanceIdx < timeline.length - 1 &&
        isAfter(currentDate, timeline[balanceIdx + 1].datetime)
      ) {
        balanceIdx++;
      }

      // find the corresponding underlying row
      while (
        harvestIdx < sortedHarvests.length - 1 &&
        isAfter(currentDate, sortedHarvests[harvestIdx + 1].date)
      ) {
        harvestIdx++;
      }

      // now we have the correct rows for this date
      const shareBalance = timeline[balanceIdx].shareBalance;
      if (shareBalance && !shareBalance.isEqualTo(BIG_ZERO)) {
        // harvest
        const { totalSupply, token0ToUsd, token1ToUsd, compoundedAmount0, compoundedAmount1 } =
          sortedHarvests[harvestIdx];

        const token0HarvestedRewardsToUsd = culmutativeFees0.plus(
          timeline[balanceIdx].shareBalance
            .dividedBy(totalSupply)
            .times(compoundedAmount0)
            .times(token0ToUsd)
        );
        const token1HarvestedRewardsToUsd = culmutativeFees1.plus(
          timeline[balanceIdx].shareBalance
            .dividedBy(totalSupply)
            .times(compoundedAmount1)
            .times(token1ToUsd)
        );

        pricesTs.push({
          //return date on seconds
          t: currentDate.getTime(),
          v0: token0HarvestedRewardsToUsd.toNumber(),
          v1: token1HarvestedRewardsToUsd.toNumber(),
        });

        culmutativeFees0 = token0HarvestedRewardsToUsd;
        culmutativeFees1 = token1HarvestedRewardsToUsd;
      }

      currentDate = new Date(currentDate.getTime() + bucketSize);
    }
  }

  return pricesTs;
}
