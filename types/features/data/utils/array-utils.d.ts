import type BigNumber from 'bignumber.js';
import type { KeysOfType } from './types-utils';
export declare const mapValuesDeep: (obj: unknown, fn: (val: unknown, key: string | number, obj: unknown) => unknown) => unknown;
export declare function createIdMap<T extends {
    id: string;
}>(arr: T[], getId?: (item: T) => string): {
    [id: string]: T;
};
export declare const intersperse: <T>(arr: T[], separator: (n: number) => T) => T[];
export type BaseEntry = {
    key: string;
    value: BigNumber;
    percentage: number;
};
export declare function getTopNArray<T extends BaseEntry>(entries: T[], key: KeysOfType<T, string | number>, topCount: number, othersBase: T): T[];
export declare function sortWith<T>(items: T[], compareFn: (a: T, b: T) => number): T[];
export declare function itemAtPercentile<T>(sortedItems: T[], percentile: number): T;
export type NonEmptyArray<T> = [T, ...T[]];
export declare function isNonEmptyArray<T>(arr: T[] | undefined | null): arr is NonEmptyArray<T>;
/** Pass to Array.filter to remove null/undefined and narrow type */
export declare function isDefined<T>(value: T): value is Exclude<T, undefined | null>;
export declare function getMostCommon<T extends string>(arr: T[]): T;
