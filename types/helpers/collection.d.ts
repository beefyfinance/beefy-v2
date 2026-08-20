export declare function minOf<K extends string, T extends Record<K, number>>(values: T[], ...keys: Array<K>): number;
export declare function maxOf<K extends string, T extends Record<K, number>>(values: T[], ...keys: Array<K>): number;
export declare function averageOf<K extends string, T extends Record<K, number>>(values: T[], key: K): number;
export declare function minMaxAverage<KAvg extends string, KMin extends string, KMax extends string, T extends Record<KAvg | KMin | KMax, number>>(values: T[], avgKey: KAvg, minKeys: Array<KMin>, maxKeys: Array<KMax>): {
    avg: number;
    min: number;
    max: number;
};
/**
 * Like lodash's groupBy but returned a typed Map instead of a plain object
 * @dev Array.from(Map, ([key, value]) => {}) is the way to map over the result
 */
export declare function groupByMap<TKey, TValue>(collection: TValue[], keyFn: (value: TValue) => TKey): Map<TKey, TValue[]>;
