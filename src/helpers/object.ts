import BigNumber from 'bignumber.js';
import { isBigNumber } from './big-number.ts';
import { cloneDeepWith, defaults as defaultsShallow, defaultsDeep } from 'lodash-es';
import type { KeysOfUnion } from '../features/data/utils/types-utils.ts';

export function cloneDeep<T>(input: T): T {
  return cloneDeepWith(input, value => {
    if (isBigNumber(value)) {
      return new BigNumber(value);
    }
    // Return undefined to let lodash handle cloning
    return undefined;
  }) as T;
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

/** Key type preserving Object.keys - assumes the object input only has the keys in type T */
export function keys<TKey extends string>(input: { [K in TKey]?: unknown }): TKey[] {
  return Object.keys(input) as TKey[];
}

export function fromKeys<K extends string, V>(arr: K[], value: V): Record<K, V> {
  return arr.reduce(
    (acc, key) => {
      acc[key] = value;
      return acc;
    },
    {} as Record<K, V>
  );
}

export function fromKeysBy<K extends string, V>(arr: K[], valueFn: (key: K) => V): Record<K, V> {
  return arr.reduce(
    (acc, key) => {
      acc[key] = valueFn(key);
      return acc;
    },
    {} as Record<K, V>
  );
}

type Mapped<T extends string, V, K extends string, KF extends (key: T) => K> = {
  [key in T as KF extends (key: key) => infer U ? U : never]: V;
};

export function fromKeysMapper<T extends string, V, K extends string, KF extends (key: T) => K>(
  arr: T[],
  valueFn: (key: T) => V,
  keyFn: KF
): Mapped<T, V, K, KF> {
  return arr.reduce(
    (acc, key) => {
      // @ts-ignore
      acc[keyFn(key)] = valueFn(key);
      return acc;
    },
    {} as Mapped<T, V, K, KF>
  );
}

/** Push value to array at map[key], or set map key to [value] if array does not exist yet */
export function pushOrSet<K extends string, V>(map: Record<K, V[]>, key: K, value: V) {
  if (map[key]) {
    map[key].push(value);
  } else {
    map[key] = [value];
  }
  return map;
}

export function typedDefaults<T extends object>(
  input: Partial<T> | undefined | null,
  defaults: T
): T {
  if (!input) {
    return { ...defaults };
  }
  return defaultsShallow({}, input || {}, defaults);
}

// @dev does not handle arrays, Maps, Sets etc
type DeepPartial<T> =
  T extends object ?
    {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export function typedDefaultsDeep<T extends object>(
  input: DeepPartial<T> | undefined | null,
  defaults: T
): T {
  if (!input) {
    return cloneDeep(defaults);
  }
  return defaultsDeep({}, input || {}, defaults) as T;
}

type DistributedOmit<TEntry, TKeys extends keyof TEntry> = {
  [K in keyof TEntry as K extends TKeys ? never : K]: TEntry[K];
};

export function distributedOmit<
  TEntry extends {
    [key: string]: unknown;
  },
  TKeys extends keyof TEntry,
>(entry: TEntry, ...keys: TKeys[]): DistributedOmit<TEntry, TKeys> {
  return Object.fromEntries(
    Object.entries(entry).filter(([key]) => !keys.includes(key as TKeys))
  ) as DistributedOmit<TEntry, TKeys>;
}

export function firstKey<
  T extends {
    [key: string]: unknown;
  },
>(obj: T): KeysOfUnion<T> | undefined {
  return Object.keys(obj)[0] as KeysOfUnion<T> | undefined;
}
