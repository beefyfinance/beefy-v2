import { getAddress } from '@ethersproject/address';

const trimReg = /(^\s*)|(\s*$)/g;

export function isValidChecksumAddress(address) {
  try {
    return address === getAddress(address);
  } catch {}

  return false;
}

export function maybeChecksumAddress(address) {
  try {
    return getAddress(address);
  } catch {}

  return false;
}

export function isEmpty(key) {
  if (key === undefined || key === '' || key === null) {
    return true;
  }
  if (typeof key === 'string') {
    key = key.replace(trimReg, '');
    return key === '' || key === null || key === 'null' || key === undefined || key === 'undefined';
  } else if (typeof key === 'undefined') {
    return true;
  } else if (typeof key == 'object') {
    for (let i in key) {
      return false;
    }
    return true;
  } else if (typeof key == 'boolean') {
    return false;
  }
}

export function objectInsert<TValue>(
  insertKey: string,
  insertValue: TValue,
  obj: Record<string, TValue>,
  relativeKey: string,
  relativePosition: 'before' | 'after' = 'after'
): Record<string, TValue> {
  if (!(relativeKey in obj)) {
    throw new Error(`${relativeKey} does not exist on object`);
  }

  return Object.fromEntries(
    Object.entries(obj).reduce((newEntries, pair) => {
      if (pair[0] === relativeKey && relativePosition === 'before')
        newEntries.push([insertKey, insertValue]);
      newEntries.push(pair);
      if (pair[0] === relativeKey && relativePosition === 'after')
        newEntries.push([insertKey, insertValue]);

      return newEntries;
    }, [] as [string, TValue][])
  );
}

export function splitMax(input: string, delim: string, max: number): string[] {
  if (max < 2) {
    throw new Error('max must be greater than 1');
  }

  const parts = input.split(delim);
  if (parts.length <= max) {
    return parts;
  }
  return [...parts.slice(0, max - 1), parts.slice(max - 1).join(delim)];
}

export function sortKeys<T extends object>(obj: T, sortFn: (a: keyof T, b: keyof T) => number): T {
  const keys = Object.keys(obj) as (keyof T)[];
  keys.sort(sortFn);
  return keys.reduce((newObj, key) => {
    newObj[key] = obj[key];
    return newObj;
  }, {} as T);
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export type NonEmptyArray<T> = [T, ...T[]];
export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0;
}

export async function mapValuesAsync<T, U>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => Promise<U>,
  skipUndefined = false
): Promise<Record<string, U>> {
  const result: Record<string, U> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newValue = await fn(value, key);
    if (!skipUndefined || newValue !== undefined) {
      result[key] = newValue;
    }
  }
  return result;
}
