import BigNumber from 'bignumber.js';
import { ApiProductPriceRow } from '../features/data/apis/analytics/analytics-types';
import { VaultTimelineAnalyticsEntity } from '../features/data/entities/analytics';
import { BIG_ZERO } from './big-number';
import { samplingPeriodMs } from './sampling-period';
import { TimeBucket, timeBucketToSamplingPeriod } from './time-bucket';

// simulate a join between the 3 price series locally
interface PriceTsRow {
  datetime: Date;
  shareBalance: BigNumber | null;
  underlyingBalance: BigNumber | null;
  usdBalance: BigNumber | null;
}

export function getInvestorTimeserie(
  timeBucket: TimeBucket,
  timeline: VaultTimelineAnalyticsEntity[],
  price1: ApiProductPriceRow[],
  price2: ApiProductPriceRow[]
): PriceTsRow[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    timeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];

  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const firstDate = new Date(lastDate.getTime() - timeRange);

  // now we need to generate the rows in order
  const sortTsAsc = (a: Date, b: Date) => a.getTime() - b.getTime();
  const sortedPrice1 = price1.sort((a, b) => sortTsAsc(a[0], b[0]));
  const sortedPrice2 = price2.sort((a, b) => sortTsAsc(a[0], b[0]));

  let balanceIdx = 0;
  let price1Idx = 0;
  let price2Idx = 0;

  const pricesTs: PriceTsRow[] = [];

  let currentDate = firstDate;
  while (currentDate <= lastDate) {
    // add a row for each date
    // find the corresponding balance row
    while (
      balanceIdx < timeline.length - 1 &&
      timeline[balanceIdx + 1].datetime.getTime() <= currentDate.getTime()
    ) {
      balanceIdx++;
    }
    // find the corresponding price1 row
    while (
      price1Idx < sortedPrice1.length - 1 &&
      sortedPrice1[price1Idx + 1][0].getTime() <= currentDate.getTime()
    ) {
      price1Idx++;
    }
    // find the corresponding price2 row
    while (
      price2Idx < sortedPrice2.length - 1 &&
      sortedPrice2[price2Idx + 1][0].getTime() <= currentDate.getTime()
    ) {
      price2Idx++;
    }

    // now we have the correct rows for this date
    const balance = timeline[balanceIdx]?.shareBalance || null;
    const isInternal = timeline[balanceIdx]?.internal || false;
    const price1 = sortedPrice1[price1Idx];
    const price2 = sortedPrice2[price2Idx];
    const underlyingBalance = price1 && balance ? price1[1].times(balance) : null;
    const usdBalance = underlyingBalance && price2 ? underlyingBalance.times(price2[1]) : null;

    if (balance && !balance.isEqualTo(BIG_ZERO) && !isInternal) {
      pricesTs.push({
        datetime: currentDate,
        shareBalance: balance,
        underlyingBalance: underlyingBalance,
        usdBalance: usdBalance,
      });
    }

    currentDate = new Date(currentDate.getTime() + bucketSize);
  }

  return pricesTs;
}
