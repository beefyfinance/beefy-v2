import type { ApiTimeBucket, ApiTimeBucketData, ApiTimeBucketInterval, ApiTimeBucketRange } from './beefy-data-api-types';
export declare const allDataApiBuckets: ApiTimeBucket[];
export declare function isDataApiBucket(bucket: string | undefined): bucket is ApiTimeBucket;
export declare function getDataApiBucket(bucket: ApiTimeBucket): ApiTimeBucketData;
export declare function getDataApiBucketIntervalKey(bucket: ApiTimeBucket): ApiTimeBucketInterval;
export declare function getDataApiBucketRangeKey(bucket: ApiTimeBucket): ApiTimeBucketRange;
export declare function getDataApiBucketRangeStartDate(bucket: ApiTimeBucket): Date;
export declare function getDataApiBucketRangeStartDateUnix(bucket: ApiTimeBucket): number;
export declare function getDataApiBucketsFromDates(start: Date, end: Date): ApiTimeBucket[];
/** Returns buckets with the same interval but smaller range */
export declare function getDataApiBucketsShorterThan(keyOrData: ApiTimeBucket | ApiTimeBucketData): ApiTimeBucketData[];
/** Returns buckets with the same interval but longer range */
export declare function getDataApiBucketsLongerThan(keyOrData: ApiTimeBucket | ApiTimeBucketData): ApiTimeBucketData[];
