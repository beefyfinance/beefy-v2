import type {
  ApiTimeBucket,
  ApiTimeBucketData,
  ApiTimeBucketInterval,
  ApiTimeBucketRange,
} from './beefy-data-api-types.ts';
import { firstKey, keys } from '../../../../helpers/object.ts';
import { getUnixTime, isAfter, isBefore, sub } from 'date-fns';
import { convertDurationSingle, isDurationEqual, isLonger } from '../../../../helpers/date.ts';
import type { DurationSingle } from '../../../../helpers/date-types.ts';

const bucketIntervals = {
  '1h': { interval: { hours: 1 } },
  '1d': { interval: { days: 1 } },
} as const satisfies Record<
  ApiTimeBucketInterval,
  {
    interval: DurationSingle;
  }
>;

const bucketRanges = {
  '1d': { range: { days: 1 }, maPeriod: { hours: 6 }, available: { days: 0 } },
  '1w': { range: { days: 7 }, maPeriod: { hours: 48 }, available: { days: 1 } },
  '1M': { range: { months: 1 }, maPeriod: { hours: 96 }, available: { days: 7 } },
  '1Y': { range: { years: 1 }, maPeriod: { days: 30 }, available: { days: 30 } },
  all: { range: { years: 10 }, maPeriod: { days: 30 }, available: { years: 1 } },
} as const satisfies Record<
  ApiTimeBucketRange,
  {
    range: DurationSingle;
    maPeriod: DurationSingle;
    available: DurationSingle;
  }
>;

function makeBucket<TId extends ApiTimeBucket>(id: TId): ApiTimeBucketData<TId> {
  const [intervalKey, rangeKey] = id.split('_') as [
    keyof typeof bucketIntervals,
    keyof typeof bucketRanges,
  ];

  const intervalData = bucketIntervals[intervalKey];
  const rangeData = bucketRanges[rangeKey];

  return {
    id,
    intervalKey,
    ...intervalData,
    rangeKey,
    ...rangeData,
    maPeriod: convertDurationSingle(rangeData.maPeriod, firstKey(intervalData.interval)!),
  };
}

const timeBuckets = {
  '1h_1d': makeBucket('1h_1d'),
  '1h_1w': makeBucket('1h_1w'),
  '1h_1M': makeBucket('1h_1M'),
  '1d_1M': makeBucket('1d_1M'),
  '1d_1Y': makeBucket('1d_1Y'),
  '1d_all': makeBucket('1d_all'),
} as const satisfies {
  [K in ApiTimeBucket]: ApiTimeBucketData<K>;
};

export const allDataApiBuckets: ApiTimeBucket[] = keys(timeBuckets);

export function isDataApiBucket(bucket: string | undefined): bucket is ApiTimeBucket {
  return !!bucket && bucket in timeBuckets;
}

export function getDataApiBucket(bucket: ApiTimeBucket): ApiTimeBucketData {
  return timeBuckets[bucket];
}

export function getDataApiBucketIntervalKey(bucket: ApiTimeBucket): ApiTimeBucketInterval {
  return getDataApiBucket(bucket).intervalKey;
}

export function getDataApiBucketRangeKey(bucket: ApiTimeBucket): ApiTimeBucketRange {
  return getDataApiBucket(bucket).rangeKey;
}

export function getDataApiBucketRangeStartDate(bucket: ApiTimeBucket): Date {
  const data = getDataApiBucket(bucket);
  return sub(sub(new Date(), data.range), data.maPeriod);
}

export function getDataApiBucketRangeStartDateUnix(bucket: ApiTimeBucket): number {
  return getUnixTime(getDataApiBucketRangeStartDate(bucket));
}

export function getDataApiBucketsFromDates(start: Date, end: Date): ApiTimeBucket[] {
  const now = new Date();
  return allDataApiBuckets.filter(bucketKey => {
    const bucket = getDataApiBucket(bucketKey);
    return isBefore(start, sub(now, bucket.available)) && isAfter(end, sub(now, bucket.range));
  });
}

/** Returns buckets with the same interval but smaller range */
export function getDataApiBucketsShorterThan(
  keyOrData: ApiTimeBucket | ApiTimeBucketData
): ApiTimeBucketData[] {
  const thisBucket = typeof keyOrData === 'string' ? getDataApiBucket(keyOrData) : keyOrData;

  return allDataApiBuckets
    .map(getDataApiBucket)
    .filter(
      otherBucket =>
        isDurationEqual(thisBucket.interval, otherBucket.interval) &&
        isLonger(thisBucket.range, otherBucket.range)
    );
}

/** Returns buckets with the same interval but longer range */
export function getDataApiBucketsLongerThan(
  keyOrData: ApiTimeBucket | ApiTimeBucketData
): ApiTimeBucketData[] {
  const thisBucket = typeof keyOrData === 'string' ? getDataApiBucket(keyOrData) : keyOrData;

  return allDataApiBuckets
    .map(getDataApiBucket)
    .filter(
      otherBucket =>
        isDurationEqual(thisBucket.interval, otherBucket.interval) &&
        isLonger(otherBucket.range, thisBucket.range)
    );
}
