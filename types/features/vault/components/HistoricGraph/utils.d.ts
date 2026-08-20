import type { ApiTimeBucket } from '../../../data/apis/beefy/beefy-data-api-types';
import type { ChartStat } from './types';
export declare const SNAPSHOT_INTERVAL: number;
export type TimeRange = '1Day' | '1Week' | '1Month' | '1Year';
export declare const timeRangeToBucket: Record<TimeRange, ApiTimeBucket>;
export declare function getAvailableRanges(availableBuckets: Record<ApiTimeBucket, boolean>): TimeRange[];
export declare function getDefaultTimeRange(availableRanges: TimeRange[]): TimeRange;
export declare function getNextSnapshot(): number;
export declare function getLatestSnapshot(): number;
export declare function getBucketParams(bucket: ApiTimeBucket): {
    startEpoch: number;
    maPeriods: number;
    maUnit: keyof import("date-fns").Duration;
};
export declare function getDefaultStat(availableStats: ChartStat[]): ChartStat;
