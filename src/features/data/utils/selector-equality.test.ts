import BigNumber from 'bignumber.js';
import { isEqual } from 'lodash-es';
import { describe, expect, it } from 'vitest';
import type { TokenEntity } from '../entities/token.ts';
import type { TokenAmount } from '../apis/transact/transact-types.ts';
import {
  bigNumberEqual,
  bigNumberRecordEqual,
  deepEqualBigNumberAware,
  numberEqual,
  tokenAmountsEqual,
} from './selector-equality.ts';

const tokenA = { id: 'A' } as unknown as TokenEntity;
const tokenB = { id: 'B' } as unknown as TokenEntity;
const amount = (token: TokenEntity, value: string): TokenAmount =>
  ({ token, amount: new BigNumber(value) }) as TokenAmount;

describe('bigNumberEqual', () => {
  it('is true for the same reference', () => {
    const value = new BigNumber(1);
    expect(bigNumberEqual(value, value)).toBe(true);
  });

  it('is true for equal values', () => {
    expect(bigNumberEqual(new BigNumber('1.50'), new BigNumber('1.5'))).toBe(true);
  });

  it('is false for different values', () => {
    expect(bigNumberEqual(new BigNumber(1), new BigNumber(2))).toBe(false);
  });

  it('treats two NaN as equal', () => {
    expect(bigNumberEqual(new BigNumber(NaN), new BigNumber(NaN))).toBe(true);
  });

  it('treats NaN and a number as unequal', () => {
    expect(bigNumberEqual(new BigNumber(NaN), new BigNumber(0))).toBe(false);
    expect(bigNumberEqual(new BigNumber(0), new BigNumber(NaN))).toBe(false);
  });

  it('treats negative zero and zero as equal', () => {
    expect(bigNumberEqual(new BigNumber(-0), new BigNumber(0))).toBe(true);
  });
});

describe('deepEqualBigNumberAware', () => {
  it('matches nested equal BigNumbers', () => {
    expect(deepEqualBigNumberAware({ v: new BigNumber('2.0') }, { v: new BigNumber(2) })).toBe(
      true
    );
  });

  it('separates nested different BigNumbers', () => {
    expect(deepEqualBigNumberAware({ v: new BigNumber(2) }, { v: new BigNumber(3) })).toBe(false);
  });

  it('keeps a fully withdrawn position stable', () => {
    expect(
      deepEqualBigNumberAware(
        { yieldPercentage: new BigNumber(NaN) },
        { yieldPercentage: new BigNumber(NaN) }
      )
    ).toBe(true);
  });

  it('still compares non-BigNumber fields', () => {
    expect(
      deepEqualBigNumberAware({ id: 'a', v: new BigNumber(1) }, { id: 'b', v: new BigNumber(1) })
    ).toBe(false);
  });

  it('compares arrays of BigNumbers', () => {
    expect(deepEqualBigNumberAware([new BigNumber(1)], [new BigNumber('1.0')])).toBe(true);
    expect(deepEqualBigNumberAware([new BigNumber(1)], [new BigNumber(1), new BigNumber(2)])).toBe(
      false
    );
  });

  it('compares BigNumbers by value where their internals differ', () => {
    expect(isEqual({ v: new BigNumber(-0) }, { v: new BigNumber(0) })).toBe(false);
    expect(deepEqualBigNumberAware({ v: new BigNumber(-0) }, { v: new BigNumber(0) })).toBe(true);
    expect(
      deepEqualBigNumberAware([{ deep: [new BigNumber(-0)] }], [{ deep: [new BigNumber(0)] }])
    ).toBe(true);
  });

  it('is false when a BigNumber is compared against a missing value', () => {
    expect(
      deepEqualBigNumberAware<{ v: BigNumber | undefined }>(
        { v: new BigNumber(NaN) },
        { v: undefined }
      )
    ).toBe(false);
    expect(deepEqualBigNumberAware<Record<string, BigNumber>>({ v: new BigNumber(1) }, {})).toBe(
      false
    );
  });
});

describe('bigNumberRecordEqual', () => {
  it('is true for the same reference', () => {
    const record = { a: new BigNumber(1) };
    expect(bigNumberRecordEqual(record, record)).toBe(true);
  });

  it('is true for equal records', () => {
    expect(bigNumberRecordEqual({ a: new BigNumber('1.0') }, { a: new BigNumber(1) })).toBe(true);
  });

  it('is false when a value differs', () => {
    expect(bigNumberRecordEqual({ a: new BigNumber(1) }, { a: new BigNumber(2) })).toBe(false);
  });

  it('is false when key counts differ', () => {
    expect(
      bigNumberRecordEqual({ a: new BigNumber(1) }, { a: new BigNumber(1), b: new BigNumber(1) })
    ).toBe(false);
  });

  it('is false when keys differ but counts match', () => {
    expect(bigNumberRecordEqual({ a: new BigNumber(1) }, { b: new BigNumber(1) })).toBe(false);
  });

  it('treats NaN entries as equal', () => {
    expect(bigNumberRecordEqual({ a: new BigNumber(NaN) }, { a: new BigNumber(NaN) })).toBe(true);
  });

  it('is false when only one of several values differs', () => {
    expect(
      bigNumberRecordEqual(
        { a: new BigNumber(1), b: new BigNumber(2), c: new BigNumber(3) },
        { a: new BigNumber(1), b: new BigNumber(2), c: new BigNumber(4) }
      )
    ).toBe(false);
  });

  it('is false when a NaN entry is missing from the other record', () => {
    expect(bigNumberRecordEqual({ a: new BigNumber(NaN) }, { b: new BigNumber(NaN) })).toBe(false);
  });

  it('does not count an inherited key as present', () => {
    expect(bigNumberRecordEqual({ toString: new BigNumber(NaN) }, { a: new BigNumber(NaN) })).toBe(
      false
    );
  });

  it('is true for two empty records', () => {
    expect(bigNumberRecordEqual({}, {})).toBe(true);
  });
});

describe('tokenAmountsEqual', () => {
  it('is true for the same reference', () => {
    const amounts = [amount(tokenA, '1')];
    expect(tokenAmountsEqual(amounts, amounts)).toBe(true);
  });

  it('is true for equal amounts of the same token', () => {
    expect(tokenAmountsEqual([amount(tokenA, '1.0')], [amount(tokenA, '1')])).toBe(true);
  });

  it('is false when the amount differs', () => {
    expect(tokenAmountsEqual([amount(tokenA, '1')], [amount(tokenA, '2')])).toBe(false);
  });

  it('is false when the token differs', () => {
    expect(tokenAmountsEqual([amount(tokenA, '1')], [amount(tokenB, '1')])).toBe(false);
  });

  it('is false for different lengths', () => {
    expect(tokenAmountsEqual([amount(tokenA, '1')], [])).toBe(false);
  });

  it('is true for two empty arrays', () => {
    expect(tokenAmountsEqual([], [])).toBe(true);
  });

  it('is false when only the last of several entries differs', () => {
    expect(
      tokenAmountsEqual(
        [amount(tokenA, '1'), amount(tokenB, '2')],
        [amount(tokenA, '1'), amount(tokenB, '3')]
      )
    ).toBe(false);
  });

  it('is false when only the order differs', () => {
    expect(
      tokenAmountsEqual(
        [amount(tokenA, '1'), amount(tokenB, '2')],
        [amount(tokenB, '2'), amount(tokenA, '1')]
      )
    ).toBe(false);
  });

  it('treats NaN amounts as equal', () => {
    expect(tokenAmountsEqual([amount(tokenA, 'NaN')], [amount(tokenA, 'NaN')])).toBe(true);
  });
});

describe('numberEqual', () => {
  it('is true for equal numbers', () => {
    expect(numberEqual(1.5, 1.5)).toBe(true);
  });

  it('is false for different numbers', () => {
    expect(numberEqual(1, 2)).toBe(false);
  });

  it('treats two NaN as equal', () => {
    expect(numberEqual(0 / 0, 0 / 0)).toBe(true);
  });

  it('treats NaN and a number as unequal', () => {
    expect(numberEqual(0 / 0, 0)).toBe(false);
  });
});

describe('numberEqual with optional numbers', () => {
  it('treats two undefined as equal', () => {
    expect(numberEqual(undefined, undefined)).toBe(true);
  });

  it('treats undefined and a number as unequal', () => {
    expect(numberEqual(undefined, 0)).toBe(false);
    expect(numberEqual(0, undefined)).toBe(false);
  });

  it('treats undefined and NaN as unequal', () => {
    expect(numberEqual(undefined, 0 / 0)).toBe(false);
  });
});
