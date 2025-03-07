export function minOf<K extends string, T extends Record<K, number>>(
  values: T[],
  ...keys: Array<K>
): number {
  return values.reduce((a, b) => Math.min(a, ...keys.map(k => b[k])), Infinity);
}

export function maxOf<K extends string, T extends Record<K, number>>(
  values: T[],
  ...keys: Array<K>
): number {
  return values.reduce((a, b) => Math.max(a, ...keys.map(k => b[k])), -Infinity);
}

export function averageOf<K extends string, T extends Record<K, number>>(
  values: T[],
  key: K
): number {
  return values.reduce((a, b) => a + b[key], 0) / values.length;
}

export function minMaxAverage<
  KAvg extends string,
  KMin extends string,
  KMax extends string,
  T extends Record<KAvg | KMin | KMax, number>,
>(
  values: T[],
  avgKey: KAvg,
  minKeys: Array<KMin>,
  maxKeys: Array<KMax>
): {
  avg: number;
  min: number;
  max: number;
} {
  return {
    avg: averageOf(values, avgKey),
    min: minOf(values, ...minKeys),
    max: maxOf(values, ...maxKeys),
  };
}

/**
 * Like lodash's groupBy but returned a typed Map instead of a plain object
 * @dev Array.from(Map, ([key, value]) => {}) is the way to map over the result
 */
export function groupByMap<TKey, TValue>(
  collection: TValue[],
  keyFn: (value: TValue) => TKey
): Map<TKey, TValue[]> {
  return collection.reduce((acc, value) => {
    const key = keyFn(value);
    const group = acc.get(key);
    if (group) {
      group.push(value);
    } else {
      acc.set(key, [value]);
    }
    return acc;
  }, new Map<TKey, TValue[]>());
}
