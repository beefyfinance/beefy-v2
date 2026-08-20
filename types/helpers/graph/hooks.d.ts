import type { GraphBucket } from './types';
export declare function useYAxis(min: number, max: number, formatterBuilder: (domain: [number, number]) => (value: number) => string, domainOffsetPercent?: number): {
    domain: [number, number];
    ticks: number[];
    formatter: (value: number) => string;
};
export declare function useXAxis(timeBucket: GraphBucket, dataLength: number, xsDown: boolean): {
    interval: number;
    formatter: (value: number) => string;
};
