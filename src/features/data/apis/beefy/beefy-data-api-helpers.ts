import type { ApiTimeBucket, ApiTimeBucketData } from './beefy-data-api-types';
import { keys } from '../../../../helpers/object';
import { keyBy } from 'lodash';

function toBucketMap<T extends Array<ApiTimeBucketData>>(arr: T) {
  return keyBy(arr, 'id') as { [K in T[number]['id']]: Extract<T[number], { id: K }> };
}

export const TIME_BUCKETS = toBucketMap([
  {
    id: '1h_1d',
    interval: { hours: 1 },
    range: { days: 1 },
    maPeriod: { hours: 6 },
    available: { days: 0 },
  },
  {
    id: '1h_1w',
    interval: { hours: 1 },
    range: { days: 7 },
    maPeriod: { hours: 48 },
    available: { days: 1 },
  },
  {
    id: '1d_1M',
    interval: { days: 1 },
    range: { months: 1 },
    maPeriod: { days: 10 },
    available: { days: 7 },
  },
  {
    id: '1d_1Y',
    interval: { days: 1 },
    range: { years: 1 },
    maPeriod: { days: 30 },
    available: { months: 1 },
  },
  {
    id: '1d_all',
    interval: { days: 1 },
    range: { years: 10 },
    maPeriod: { days: 30 },
    available: { years: 1 },
  },
] as const satisfies ApiTimeBucketData[]);

export const allDataApiBuckets = keys(TIME_BUCKETS);

export function isDataApiBucket(bucket: string | undefined): bucket is ApiTimeBucket {
  return !!bucket && bucket in TIME_BUCKETS;
}

export function getDataApiBucket(bucket: ApiTimeBucket): ApiTimeBucketData {
  return TIME_BUCKETS[bucket];
}
