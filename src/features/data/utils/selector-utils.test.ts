import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { arrayOrStaticEmpty, bigNumberOrStaticZero, EMPTY_ARRAY } from './selector-utils.ts';

describe('EMPTY_ARRAY', () => {
  it('is frozen, so a selector consumer cannot mutate every other selector result', () => {
    expect(Object.isFrozen(EMPTY_ARRAY)).toBe(true);
    expect(() => (EMPTY_ARRAY as unknown[]).push(1)).toThrow(TypeError);
  });

  it('is empty', () => {
    expect(EMPTY_ARRAY).toHaveLength(0);
  });
});

describe('arrayOrStaticEmpty', () => {
  it('returns the shared reference for every empty case, so subscribers do not re-render', () => {
    expect(arrayOrStaticEmpty([])).toBe(EMPTY_ARRAY);
    expect(arrayOrStaticEmpty(undefined)).toBe(EMPTY_ARRAY);
    expect(arrayOrStaticEmpty(null)).toBe(EMPTY_ARRAY);
    expect(arrayOrStaticEmpty([])).toBe(arrayOrStaticEmpty(undefined));
  });

  it('returns the input unchanged when it has entries', () => {
    const input = [1, 2, 3];
    expect(arrayOrStaticEmpty(input)).toBe(input);
  });
});

describe('bigNumberOrStaticZero', () => {
  it('returns the shared zero for every zero-valued case', () => {
    expect(bigNumberOrStaticZero(new BigNumber(0))).toBe(BIG_ZERO);
    expect(bigNumberOrStaticZero(undefined)).toBe(BIG_ZERO);
    expect(bigNumberOrStaticZero(null)).toBe(BIG_ZERO);
  });

  it('returns the input unchanged when it is non-zero', () => {
    const input = new BigNumber(5);
    expect(bigNumberOrStaticZero(input)).toBe(input);
  });

  it('does not treat NaN as zero', () => {
    const nan = new BigNumber(NaN);
    expect(bigNumberOrStaticZero(nan)).toBe(nan);
  });
});
