import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { areArraysEqual } from './array-utils.ts';

describe('areArraysEqual', () => {
  it('short-circuits true for the same reference', () => {
    const a = ['x', 'y'];
    expect(areArraysEqual(a, a)).toBe(true);
  });

  it('is true for equal-content arrays (strict ===)', () => {
    expect(areArraysEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
  });

  it('is false for different lengths', () => {
    expect(areArraysEqual(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
  });

  it('is false when an element differs', () => {
    expect(areArraysEqual(['a', 'b', 'c'], ['a', 'x', 'c'])).toBe(false);
  });

  it('is false when order differs', () => {
    expect(areArraysEqual(['a', 'b'], ['b', 'a'])).toBe(false);
  });

  it('handles empty arrays', () => {
    expect(areArraysEqual([], [])).toBe(true);
  });

  it('uses the optional equalFn for element comparison', () => {
    const a = [new BigNumber(1), new BigNumber(2)];
    const b = [new BigNumber(1), new BigNumber(2)];
    // strict === would be false (distinct instances); .eq makes them equal
    expect(areArraysEqual(a, b)).toBe(false);
    expect(areArraysEqual(a, b, (x, y) => x.eq(y))).toBe(true);
  });
});
