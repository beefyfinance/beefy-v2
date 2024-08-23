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
  return values.reduce((a, b) => (a + b[key]) as number, 0) / values.length;
}

export function minMaxAverage<
  KAvg extends string,
  KMin extends string,
  KMax extends string,
  T extends Record<KAvg | KMin | KMax, number>
>(
  values: T[],
  avgKey: KAvg,
  minKeys: Array<KMin>,
  maxKeys: Array<KMax>
): { avg: number; min: number; max: number } {
  return {
    avg: averageOf(values, avgKey),
    min: minOf(values, ...minKeys),
    max: maxOf(values, ...maxKeys),
  };
}
