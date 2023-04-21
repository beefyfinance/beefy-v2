import type { ApiTimeBucket } from '../../../data/apis/beefy/beefy-data-api-types';
import { fromUnixTime, getUnixTime, sub } from 'date-fns';
import type { ChartStat } from '../../../data/reducers/historical-types';
import { first } from 'lodash-es';

// must match API
export const SNAPSHOT_INTERVAL: number = 15 * 60;

// must match API
export const TIME_BUCKETS = {
  '1h_1d': {
    interval: { hours: 1 },
    range: { days: 1 },
    maPeriod: { hours: 6 },
    available: { days: 0 },
  },
  '1h_1w': {
    interval: { hours: 1 },
    range: { days: 7 },
    maPeriod: { hours: 48 },
    available: { days: 1 },
  },
  '1d_1M': {
    interval: { days: 1 },
    range: { months: 1 },
    maPeriod: { days: 10 },
    available: { days: 7 },
  },
  '1d_1Y': {
    interval: { days: 1 },
    range: { years: 1 },
    maPeriod: { days: 30 },
    available: { months: 1 },
  },
} as const;

export type TimeRange = '1Day' | '1Week' | '1Month' | '1Year';

const timeRanges: TimeRange[] = ['1Day', '1Week', '1Month', '1Year'];
const defaultTimeRangeOrder: TimeRange[] = ['1Month', '1Week', '1Day'];

export const timeRangeToBucket: Record<TimeRange, ApiTimeBucket> = {
  '1Day': '1h_1d',
  '1Week': '1h_1w',
  '1Month': '1d_1M',
  '1Year': '1d_1Y',
};

export function getAvailableRanges(availableBuckets: Record<ApiTimeBucket, boolean>): TimeRange[] {
  return timeRanges.filter(range => availableBuckets[timeRangeToBucket[range]]);
}

export function getDefaultTimeRange(availableRanges: TimeRange[]): TimeRange {
  for (const range of defaultTimeRangeOrder) {
    if (availableRanges.includes(range)) {
      return range;
    }
  }

  return defaultTimeRangeOrder[defaultTimeRangeOrder.length - 1];
}

export function getNextSnapshot() {
  return Math.floor(Date.now() / (SNAPSHOT_INTERVAL * 1000)) * SNAPSHOT_INTERVAL;
}

export function getLatestSnapshot() {
  return getNextSnapshot() - SNAPSHOT_INTERVAL;
}

export function getBucketParams(bucket: ApiTimeBucket) {
  const { range, interval, maPeriod } = TIME_BUCKETS[bucket];
  const endDate = fromUnixTime(getLatestSnapshot());
  const startDate = sub(endDate, range);
  const startEpoch = getUnixTime(startDate);
  const [intervalKeys, maPeriodKeys] = [interval, maPeriod].map(values => Object.keys(values));

  if (
    intervalKeys.length !== 1 ||
    maPeriodKeys.length !== 1 ||
    intervalKeys[0] !== maPeriodKeys[0]
  ) {
    throw new Error('Invalid bucket interval/maPeriod');
  }

  const key = intervalKeys[0];
  const maPeriods = Math.floor(maPeriod[key] / interval[key]);

  return { startEpoch, maPeriods, maUnit: key };
}

export function getDefaultStat(availableStats: ChartStat[]): ChartStat {
  return first(availableStats);
}
