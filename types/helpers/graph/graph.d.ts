import type { GraphBucket } from './types';
export declare const domainOffSet: (min: number, max: number, heightPercentageUsedByChart: number) => number;
export declare const mapRangeToTicks: (min: number, max: number) => number[];
export declare const getXInterval: (dataLength: number, xsDown: boolean) => number;
export declare const GRAPH_TIME_BUCKETS: ["1h_1d", "1h_1w", "1d_1M", "1d_1Y", "1d_all"];
export declare function makeUsdTickFormatter(): (value: number) => string;
export declare function makeUnderlyingTickFormatter(domain: [number, number]): (value: number) => string;
export declare function makeDateTimeTickFormatter(timeBucket: GraphBucket): (value: number) => string;
export declare function graphTimeBucketToSamplingPeriod(timeBucket: GraphBucket): {
    readonly bucketSize: "1hour";
    readonly timeRange: "1day";
} | {
    readonly bucketSize: "1hour";
    readonly timeRange: "1week";
} | {
    readonly bucketSize: "1hour";
    readonly timeRange: "1month";
} | {
    readonly bucketSize: "1day";
    readonly timeRange: "1month";
} | {
    readonly bucketSize: "1day";
    readonly timeRange: "1year";
} | {
    readonly bucketSize: "1day";
    readonly timeRange: "100year";
};
