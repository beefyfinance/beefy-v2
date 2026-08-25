import { createSelector } from '@reduxjs/toolkit';
import { isEqual } from 'lodash-es';
import type BigNumber from 'bignumber.js';
import type { BeefyState } from '../store/types.ts';
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

/**
 * Wrap a selector that unavoidably builds a fresh object or array so that repeated calls with
 * unchanged data hand back the previous reference.
 *
 * The whole state is the input on purpose: these read a wide slice, and a hand-written input list
 * that missed one would trade a re-render for a stale figure. The compute still runs; the result
 * comparison is what stops the re-render. Arity-specific because spreading args into a single
 * input selector would itself return a fresh array on every call.
 */
export function stableSelector<R>(fn: (state: BeefyState) => R) {
  return createSelector(
    (state: BeefyState) => state,
    (state: BeefyState) => fn(state),
    { memoizeOptions: { resultEqualityCheck: isEqual } }
  );
}

export function stableSelector1<A, R>(fn: (state: BeefyState, a: A) => R) {
  return createSelector(
    (state: BeefyState, _a: A) => state,
    (_state: BeefyState, a: A) => a,
    (state: BeefyState, a: A) => fn(state, a),
    { memoizeOptions: { resultEqualityCheck: isEqual } }
  );
}

// `b` is declared optional on every input so callers that omit it still typecheck; the arity of
// the generated selector is taken from these signatures
export function stableSelector2<A, B, R>(fn: (state: BeefyState, a: A, b?: B) => R) {
  return createSelector(
    (state: BeefyState, _a: A, _b?: B) => state,
    (_state: BeefyState, a: A, _b?: B) => a,
    (_state: BeefyState, _a: A, b?: B) => b,
    (state: BeefyState, a: A, b: B | undefined) => fn(state, a, b),
    { memoizeOptions: { resultEqualityCheck: isEqual } }
  );
}

/** as stableSelector2, for selectors whose second argument is required */
export function stableSelector2Req<A, B, R>(fn: (state: BeefyState, a: A, b: B) => R) {
  return createSelector(
    (state: BeefyState, _a: A, _b: B) => state,
    (_state: BeefyState, a: A, _b: B) => a,
    (_state: BeefyState, _a: A, b: B) => b,
    (state: BeefyState, a: A, b: B) => fn(state, a, b),
    { memoizeOptions: { resultEqualityCheck: isEqual } }
  );
}
