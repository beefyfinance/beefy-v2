import { format } from 'date-fns';
import { formatLargeUsd } from '../format.ts';
import type { GraphBucket, GraphBucketParamMap } from './types.ts';

export const domainOffSet = (min: number, max: number, heightPercentageUsedByChart: number) => {
  return ((max - min) * (1 - heightPercentageUsedByChart)) / (2 * heightPercentageUsedByChart);
};

export const mapRangeToTicks = (min: number, max: number) => {
  const factors = [0, 0.25, 0.5, 0.75, 1];
  return factors.map(f => min + f * (max - min));
};

export const getXInterval = (dataLength: number, xsDown: boolean) => {
  const interval = xsDown ? 8 : 10;
  const elementsPerResult = Math.ceil(dataLength / interval);
  const numResults = Math.ceil(dataLength / elementsPerResult);
  return Math.ceil(dataLength / numResults);
};

export const GRAPH_TIME_BUCKETS = [
  '1h_1d',
  '1h_1w',
  '1d_1M',
  '1d_1Y',
  '1d_all',
] as const satisfies GraphBucket[];

export function makeUsdTickFormatter() {
  return (value: number) => formatLargeUsd(value);
}

export function makeUnderlyingTickFormatter(domain: [number, number]) {
  const [, max] = domain;
  if (max >= 0.001) {
    const decimals = max > 999 ? 0 : 3;
    return (value: number) =>
      value.toLocaleString('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      });
  }

  return (value: number) => value.toExponential(2);
}

export function makeDateTimeTickFormatter(timeBucket: GraphBucket) {
  if (timeBucket === '1h_1d') {
    return (value: number) => format(value, 'HH:mm');
  }
  return (value: number) =>
    new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
}

const bucketParamMap = {
  '1h_1d': { bucketSize: '1hour', timeRange: '1day' },
  '1h_1w': { bucketSize: '1hour', timeRange: '1week' },
  '1h_1M': { bucketSize: '1hour', timeRange: '1month' },
  '1d_1M': { bucketSize: '1day', timeRange: '1month' },
  // '4h_3M': { bucketSize: '4hour', timeRange: '3months' },
  '1d_1Y': { bucketSize: '1day', timeRange: '1year' },
  '1d_all': { bucketSize: '1day', timeRange: '100year' },
} as const satisfies GraphBucketParamMap;

export function graphTimeBucketToSamplingPeriod(timeBucket: GraphBucket) {
  return bucketParamMap[timeBucket];
}
