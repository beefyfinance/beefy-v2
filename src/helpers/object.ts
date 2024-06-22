import { BigNumber } from 'bignumber.js';
import { isBigNumber } from './big-number';
import { cloneDeepWith } from 'lodash-es';

export function cloneDeep<T>(input: T): T {
  return cloneDeepWith(input, value => {
    if (isBigNumber(value)) {
      return new BigNumber(value);
    }
    // Return undefined to let lodash handle cloning
    return undefined;
  });
}

type Entries<T> = [keyof T, T[keyof T]][];

/** Key type preserving Object.entries - assumes the object input only has the keys in type T */
export function entries<T extends object>(input: T): Entries<T> {
  return Object.entries(input) as Entries<T>;
}

type StrictEntries<T> = Exclude<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T],
  undefined
>[];

/** Pair type preserving Object.entries - assumes the object input only has the keys in type T */
export function strictEntries<T extends object>(input: T): StrictEntries<T> {
  return Object.entries(input) as StrictEntries<T>;
}

type Keys<T> = (keyof T)[];

/** Key type preserving Object.keys - assumes the object input only has the keys in type T */
export function keys<T extends Record<string, unknown>>(input: T): Keys<T> {
  return Object.keys(input) as Keys<T>;
}

export function fromKeys<K extends string, V>(arr: K[], value: V): Record<K, V> {
  return arr.reduce((acc, key) => {
    acc[key] = value;
    return acc;
  }, {} as Record<K, V>);
}

export function fromKeysBy<K extends string, V>(arr: K[], valueFn: (key: K) => V): Record<K, V> {
  return arr.reduce((acc, key) => {
    acc[key] = valueFn(key);
    return acc;
  }, {} as Record<K, V>);
}
