import { isEqualWith } from 'lodash-es';
import BigNumber from 'bignumber.js';
import type { TokenAmount } from '../apis/transact/transact-types.ts';

export function bigNumberEqual(a: BigNumber, b: BigNumber): boolean {
  return a === b || (a.isNaN() ? b.isNaN() : a.isEqualTo(b));
}

export function numberEqual(a: number | undefined, b: number | undefined): boolean {
  return a === b || (Number.isNaN(a) && Number.isNaN(b));
}

function bigNumberCustomizer(a: unknown, b: unknown): boolean | undefined {
  if (BigNumber.isBigNumber(a) && BigNumber.isBigNumber(b)) {
    return bigNumberEqual(a, b);
  }
  return undefined;
}

export function deepEqualBigNumberAware<T>(a: T, b: T): boolean {
  return isEqualWith(a, b, bigNumberCustomizer);
}

export function bigNumberRecordEqual(
  a: Record<string, BigNumber>,
  b: Record<string, BigNumber>
): boolean {
  if (a === b) {
    return true;
  }
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) {
    return false;
  }
  return keys.every(key => Object.hasOwn(b, key) && bigNumberEqual(a[key], b[key]));
}

export function tokenAmountsEqual(a: TokenAmount[], b: TokenAmount[]): boolean {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every(
    (entry, i) => entry.token === b[i].token && bigNumberEqual(entry.amount, b[i].amount)
  );
}
