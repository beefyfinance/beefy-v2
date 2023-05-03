import type BigNumber from 'bignumber.js';
import { isAfter, isBefore, isEqual, max, subDays } from 'date-fns';
import { sortBy } from 'lodash-es';
import type {
  ApiProductPriceRow,
  TimeBucketType,
} from '../features/data/apis/analytics/analytics-types';
import type { VaultTimelineAnalyticsEntity } from '../features/data/entities/analytics';
import { BIG_ZERO } from './big-number';
import { roundDownMinutes } from './date';
import { samplingPeriodMs } from './sampling-period';
import { timeBucketToSamplingPeriod } from './time-bucket';

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
  shares: ApiProductPriceRow[],
  underlying: ApiProductPriceRow[],
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
  const sortedShares = sortAndFixPrices(shares, currentPpfs);
  const sortedUnderlying = sortAndFixPrices(underlying, currentPrice);

  let balanceIdx = 0;
  let sharesIdx = 0;
  let underlyingIdx = 0;
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
        .times(timeline[0].shareToUnderlyingPrice.times(timeline[0].underlyingToUsdPrice))
        .toNumber(),
    });
    currentDate = new Date(currentDate.getTime() + bucketSize);
  }

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
      sharesIdx < sortedShares.length - 1 &&
      isAfter(currentDate, sortedShares[sharesIdx + 1].date)
    ) {
      sharesIdx++;
    }
    // find the corresponding underlying row
    while (
      underlyingIdx < sortedUnderlying.length - 1 &&
      isAfter(currentDate, sortedUnderlying[underlyingIdx + 1].date)
    ) {
      underlyingIdx++;
    }

    // now we have the correct rows for this date
    const balance = timeline[balanceIdx].shareBalance;
    if (balance && !balance.isEqualTo(BIG_ZERO)) {
      const shares = sortedShares[sharesIdx];
      const underlying = sortedUnderlying[underlyingIdx];
      const underlyingBalance = shares.value.times(balance);
      const usdBalance = underlyingBalance.times(underlying.value);

      pricesTs.push({
        //return date on seconds
        datetime: currentDate.getTime(),
        shareBalance: balance.toNumber(),
        underlyingBalance: underlyingBalance.toNumber(),
        usdBalance: usdBalance.toNumber(),
      });
    }

    currentDate = new Date(currentDate.getTime() + bucketSize);
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
