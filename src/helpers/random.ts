import { sortBy } from 'lodash-es';

/**
 * SplitMix32 PRNG — returns a function yielding deterministic floats in [0, 1) for a given seed.
 * Same seed always produces the same sequence, so it can drive reproducible shuffles.
 */
function makePRNG(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x9e3779b9) | 0;
    let num = seed ^ (seed >>> 16);
    num = Math.imul(num, 0x21f0aaad);
    num = num ^ (num >>> 15);
    num = Math.imul(num, 0x735a2d97);
    return ((num = num ^ (num >>> 15)) >>> 0) / 4294967296;
  };
}

/**
 * Return a new array with `items` shuffled deterministically from `seed` (input left untouched).
 * Same seed + same items always produce the same order.
 */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rng = makePRNG(seed);
  return sortBy(items, () => rng());
}
