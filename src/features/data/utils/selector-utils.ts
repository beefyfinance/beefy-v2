import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number.ts';

export function valueOrThrow<T>(
  value: T | undefined | null,
  message: string = 'selector: value is not set'
): T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
  return value;
}

/** For returning from selectors so a new object isn't created causing a re-render */
export const EMPTY_ARRAY = Object.freeze([]);

export function arrayOrStaticEmpty<T>(arr: T[] | undefined | null): T[] {
  return !!arr && arr.length ? arr : (EMPTY_ARRAY as unknown as T[]);
}

export function bigNumberOrStaticZero(value: BigNumber | undefined | null): BigNumber {
  if (!value || value.isZero()) {
    return BIG_ZERO;
  }
  return value;
}

type CompareFn<T> = (a: T, b: T) => boolean;

function referenceEqualityCheck<T>(a: T, b: T): boolean {
  return a === b;
}

export function bigNumberEqualityCheck(a: BigNumber, b: BigNumber): boolean {
  if (a === b) return true;
  return a.isEqualTo(b);
}

/** @dev sort before calling if you don't need array to be in same order */
export function areArraysEqual<T>(
  a: T[],
  b: T[],
  compareFn: CompareFn<T> = referenceEqualityCheck
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (!compareFn(a[i], b[i])) {
      return false;
    }
  }

  return true;
}
