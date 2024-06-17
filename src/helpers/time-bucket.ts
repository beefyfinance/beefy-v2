import type { SamplingPeriod } from './sampling-period';
import type { GraphBucket } from './graph';

type BucketParamMap = {
  [key in GraphBucket]: { bucketSize: SamplingPeriod; timeRange: SamplingPeriod };
};

const bucketParamMap = {
  '1h_1d': { bucketSize: '1hour', timeRange: '1day' },
  '1h_1w': { bucketSize: '1hour', timeRange: '1week' },
  // '1h_1M': { bucketSize: '1hour', timeRange: '1month' },
  '1d_1M': { bucketSize: '1day', timeRange: '1month' },
  // '4h_3M': { bucketSize: '4hour', timeRange: '3months' },
  '1d_1Y': { bucketSize: '1day', timeRange: '1year' },
  '1d_all': { bucketSize: '1day', timeRange: '100year' },
} as const satisfies BucketParamMap;

export function graphTimeBucketToSamplingPeriod(timeBucket: GraphBucket) {
  return bucketParamMap[timeBucket];
}
