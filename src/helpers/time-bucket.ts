import { TimeBucketType } from '../features/data/apis/analytics/analytics-types';
import { SamplingPeriod } from './sampling-period';

export function timeBucketToSamplingPeriod(timeBucket: TimeBucketType) {
  const bucketParamMap: {
    [key in TimeBucketType]: {
      bucketSize: SamplingPeriod;
      timeRange: SamplingPeriod;
    };
  } = {
    '1h_1d': { bucketSize: '1hour', timeRange: '1day' },
    '1h_1w': { bucketSize: '1hour', timeRange: '1week' },
    '1d_1M': { bucketSize: '1day', timeRange: '1month' },
    '1d_1Y': { bucketSize: '1day', timeRange: '1year' },
  };
  return bucketParamMap[timeBucket];
}

export function assertIsValidTimeBucket(bucketSize: SamplingPeriod, timeRange: SamplingPeriod) {
  const isValidCombination =
    (bucketSize === '1hour' && timeRange === '1day') ||
    (bucketSize === '1hour' && timeRange === '1week') ||
    (bucketSize === '1day' && timeRange === '1month') ||
    (bucketSize === '1day' && timeRange === '1year');
  if (!isValidCombination) {
    throw new Error('Invalid bucketSize and timeRange combination');
  }
}
