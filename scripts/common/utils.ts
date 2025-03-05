import { type Address, getAddress } from 'viem';
import { entries } from '../../src/helpers/object.ts';

export function isValidChecksumAddress(address: unknown): address is Address {
  if (typeof address !== 'string') {
    return false;
  }

  try {
    const checksumAddress = getAddress(address);
    return address === checksumAddress;
  } catch {
    return false;
  }
}

export function maybeChecksumAddress(address: unknown): Address | false {
  if (typeof address !== 'string') {
    return false;
  }

  try {
    return getAddress(address);
  } catch {
    // Invalid address
  }

  return false;
}

export function sortKeys<T extends object>(obj: T, sortFn: (a: keyof T, b: keyof T) => number): T {
  const keys = Object.keys(obj) as (keyof T)[];
  keys.sort(sortFn);
  return keys.reduce((newObj, key) => {
    newObj[key] = obj[key];
    return newObj;
  }, {} as T);
}

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0;
}

export async function mapValuesAsync<
  TKey extends string,
  TOriginal,
  TObj extends { [K in TKey]?: TOriginal },
  TNew,
>(
  obj: TObj,
  fn: (value: TObj[keyof TObj], key: keyof TObj) => Promise<TNew>,
  skipUndefined = false
): Promise<{ [K in keyof TObj]?: TNew }> {
  const result = {} as { [K in keyof TObj]?: TNew };
  for (const [key, value] of entries(obj)) {
    const newValue = await fn(value, key);
    if (!skipUndefined || newValue !== undefined) {
      result[key] = newValue;
    }
  }
  return result;
}
