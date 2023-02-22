import BigNumber from 'bignumber.js';
import { max } from 'date-fns';
import { sortBy } from 'lodash';
import {
  ApiProductPriceRow,
  TimeBucketType,
} from '../features/data/apis/analytics/analytics-types';
import { VaultTimelineAnalyticsEntity } from '../features/data/entities/analytics';
import { BIG_ZERO } from './big-number';
import { samplingPeriodMs } from './sampling-period';
import { timeBucketToSamplingPeriod } from './time-bucket';

// simulate a join between the 3 price series locally
export interface PriceTsRow {
  datetime: Date;
  shareBalance: BigNumber | null;
  underlyingBalance: BigNumber | null;
  usdBalance: BigNumber | null;
}

export function getInvestorTimeserie(
  timeBucket: TimeBucketType,
  timeline: VaultTimelineAnalyticsEntity[],
  shares: ApiProductPriceRow[],
  underlying: ApiProductPriceRow[],
  firstDate: Date
): PriceTsRow[] {
  // so, first we need to generate datetime keys for each row
  const { bucketSize: bucketSizeStr, timeRange: timeRangeStr } =
    timeBucketToSamplingPeriod(timeBucket);
  const bucketSize = samplingPeriodMs[bucketSizeStr];
  const timeRange = samplingPeriodMs[timeRangeStr];

  const lastDate = new Date(Math.floor(new Date().getTime() / bucketSize) * bucketSize);
  const firstDate1 = new Date(lastDate.getTime() - timeRange);

  const fixedDate = max([firstDate, firstDate1]);

  const sortedShares = sortBy(shares, 'timeline');
  const sortedUnderlying = sortBy(underlying, 'timeline');

  let balanceIdx = 0;
  let sharesIdx = 0;
  let underlyingIdx = 0;

  const pricesTs: PriceTsRow[] = [];

  let currentDate = fixedDate;
  while (currentDate <= lastDate) {
    // add a row for each date
    // find the corresponding balance row
    while (balanceIdx < timeline.length - 1 && timeline[balanceIdx + 1].datetime <= currentDate) {
      balanceIdx++;
    }
    // find the corresponding shares row
    while (sharesIdx < sortedShares.length - 1 && sortedShares[sharesIdx + 1].date <= currentDate) {
      sharesIdx++;
    }
    // find the corresponding underlying row
    while (
      underlyingIdx < sortedUnderlying.length - 1 &&
      sortedUnderlying[underlyingIdx + 1].date <= currentDate
    ) {
      underlyingIdx++;
    }

    // now we have the correct rows for this date
    const balance = timeline[balanceIdx]?.shareBalance || null;
    const isInternal = timeline[balanceIdx]?.internal || false;
    const shares = sortedShares[sharesIdx];
    const underlying = sortedUnderlying[underlyingIdx];
    const underlyingBalance = shares && balance ? shares.value.times(balance) : null;
    const usdBalance =
      underlyingBalance && underlying ? underlyingBalance.times(underlying.value) : null;

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
