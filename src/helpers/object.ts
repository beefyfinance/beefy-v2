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

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

/** Key type preserving Object.entries - assumes the object input only has the keys in type T */
export function entries<T extends Record<string, unknown>>(input: T): Entries<T> {
  return Object.entries(input) as Entries<T>;
}

type Keys<T> = (keyof T)[];

/** Key type preserving Object.keys - assumes the object input only has the keys in type T */
export function keys<T extends Record<string, unknown>>(input: T): Keys<T> {
  return Object.keys(input) as Keys<T>;
}
