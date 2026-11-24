import type { ApiTimeBucket } from '../../../data/apis/beefy/beefy-data-api-types.ts';
import { first } from 'lodash-es';
import type { ChartStat } from './types.ts';

export type TimeRange = '1Day' | '1Week' | '1Month' | '1Year';

const timeRanges: TimeRange[] = ['1Day', '1Week', '1Month', '1Year'];
const defaultTimeRangeOrder: TimeRange[] = ['1Year', '1Month', '1Week', '1Day'];

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

export function getDefaultStat(availableStats: ChartStat[]): ChartStat {
  const defaultStat = first(availableStats);
  if (!defaultStat) throw new Error('No default stat');
  return defaultStat;
}
