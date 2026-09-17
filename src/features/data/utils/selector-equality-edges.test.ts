import BigNumber from 'bignumber.js';
import { isEqual } from 'lodash-es';
import { describe, expect, it } from 'vitest';
import type { TokenAmount } from '../apis/transact/transact-types.ts';
import type { TokenEntity } from '../entities/token.ts';
import {
  bigNumberEqual,
  bigNumberRecordEqual,
  deepEqualBigNumberAware,
  numberEqual,
  tokenAmountsEqual,
} from './selector-equality.ts';

const token = { id: 'A' } as unknown as TokenEntity;
const amount = (value: BigNumber): TokenAmount => ({ token, amount: value }) as TokenAmount;

describe('what the customizer in deepEqualBigNumberAware actually buys', () => {
  const pairs: Array<[string, BigNumber, BigNumber, boolean]> = [
    ['same value, different instances', new BigNumber(1), new BigNumber(1), true],
    ['same value, different literal', new BigNumber('1.50'), new BigNumber(1.5), true],
    ['same value, exponent notation', new BigNumber('1e3'), new BigNumber(1000), true],
    ['different values', new BigNumber(1), new BigNumber(2), false],
    ['NaN and NaN', new BigNumber(NaN), new BigNumber(NaN), true],
    ['NaN and a number', new BigNumber(NaN), new BigNumber(0), false],
    ['Infinity and Infinity', new BigNumber(Infinity), new BigNumber(Infinity), true],
    ['Infinity and -Infinity', new BigNumber(Infinity), new BigNumber(-Infinity), false],
    ['zero and negative zero', new BigNumber(0), new BigNumber(-0), true],
  ];

  it.each(pairs)('%s', (_name, a, b, expected) => {
    expect(bigNumberEqual(a, b)).toBe(expected);
    expect(deepEqualBigNumberAware({ v: a }, { v: b })).toBe(expected);
  });

  it('plain lodash isEqual agrees on every pair except zero vs negative zero', () => {
    const divergent = pairs.filter(
      ([, a, b, expected]) => isEqual({ v: a }, { v: b }) !== expected
    );
    expect(divergent.map(([name]) => name)).toEqual(['zero and negative zero']);
  });

  it('Symbol.toStringTag does not stop lodash comparing two BigNumbers by value', () => {
    // getRawTag unmasks the prototype tag, so lodash sees a plain object and compares the fields
    expect(Object.prototype.toString.call(new BigNumber(1))).toBe('[object BigNumber]');
    expect(isEqual(new BigNumber(1), new BigNumber(1))).toBe(true);
    const lookalike = { s: 1, e: 0, c: [1] };
    expect(isEqual(new BigNumber(1), lookalike)).toBe(false);
    expect(deepEqualBigNumberAware<unknown>(new BigNumber(1), lookalike)).toBe(false);
  });
});

describe('negative zero is reachable, so the customizer earns its keep', () => {
  const ZERO = new BigNumber(0);

  it.each([
    ['negated()', ZERO.negated()],
    ['times(-1)', ZERO.times(-1)],
    ['dividedBy(-5)', ZERO.dividedBy(-5)],
    ['a negative multiplied by zero', new BigNumber(-1).times(0)],
    ["new BigNumber('-0')", new BigNumber('-0')],
  ])('%s produces a BigNumber that plain isEqual separates from zero', (_name, value) => {
    expect(value.isZero()).toBe(true);
    expect(isEqual(value, ZERO)).toBe(false);
    expect(bigNumberEqual(value, ZERO)).toBe(true);
    expect(deepEqualBigNumberAware({ v: value }, { v: ZERO })).toBe(true);
  });

  it('and the same value nested in arrays and records', () => {
    const negZero = new BigNumber(0).negated();
    expect(deepEqualBigNumberAware([{ deep: [negZero] }], [{ deep: [ZERO] }])).toBe(true);
    expect(bigNumberRecordEqual({ a: negZero }, { a: ZERO })).toBe(true);
    expect(tokenAmountsEqual([amount(negZero)], [amount(ZERO)])).toBe(true);
  });

  it('numberEqual agrees with bigNumberEqual and lodash about negative zero', () => {
    expect(bigNumberEqual(new BigNumber(-0), new BigNumber(0))).toBe(true);
    expect(numberEqual(-0, 0)).toBe(true);
    expect(isEqual(-0, 0)).toBe(true);
  });
});

describe('NaN survives every comparator, end to end', () => {
  const nan = () => new BigNumber(NaN);

  it('through deepEqualBigNumberAware on a realistic PnL shape', () => {
    const shape = () => ({
      vaultId: 'a-vault',
      balance: new BigNumber(0),
      usdBalance: new BigNumber(0),
      yieldPercentage: nan(),
      pnlPercentage: nan(),
      tokens: [{ amount: nan() }],
    });
    expect(deepEqualBigNumberAware(shape(), shape())).toBe(true);
  });

  it('through bigNumberRecordEqual on a daily-yield map', () => {
    expect(
      bigNumberRecordEqual({ a: nan(), b: new BigNumber(1) }, { a: nan(), b: new BigNumber(1) })
    ).toBe(true);
  });

  it('through tokenAmountsEqual on a stepper result', () => {
    expect(tokenAmountsEqual([amount(nan())], [amount(nan())])).toBe(true);
  });

  it('and numberEqual, whose whole reason for existing is the same case', () => {
    const share = (beefy: number, underlying: number) => Math.min(beefy / underlying, 1);
    expect(Number.isNaN(share(NaN, 5))).toBe(true);
    expect(numberEqual(share(NaN, 5), share(NaN, 5))).toBe(true);
    expect(numberEqual(share(0, 0), share(0, 0))).toBe(true);
  });
});

describe('comparator contract', () => {
  const values: BigNumber[] = [
    new BigNumber(0),
    new BigNumber(0).negated(),
    new BigNumber(1),
    new BigNumber('1.50'),
    new BigNumber(NaN),
    new BigNumber(Infinity),
    new BigNumber(-Infinity),
  ];

  it('bigNumberEqual is reflexive and symmetric over every value above', () => {
    for (const a of values) {
      expect(bigNumberEqual(a, a)).toBe(true);
      for (const b of values) {
        expect(bigNumberEqual(a, b)).toBe(bigNumberEqual(b, a));
      }
    }
  });

  it('bigNumberEqual is transitive over every value above', () => {
    for (const a of values) {
      for (const b of values) {
        for (const c of values) {
          if (bigNumberEqual(a, b) && bigNumberEqual(b, c)) {
            expect(bigNumberEqual(a, c)).toBe(true);
          }
        }
      }
    }
  });

  it('bigNumberRecordEqual throws on an absent value rather than reporting a difference', () => {
    // documented, not endorsed: the type forbids a hole and every caller builds a total record
    const record = { a: undefined } as unknown as Record<string, BigNumber>;
    expect(() => bigNumberRecordEqual(record, { a: new BigNumber(1) })).toThrow(TypeError);
    // the mirror direction does not throw: it coerces undefined to NaN and reports a difference
    expect(bigNumberRecordEqual({ a: new BigNumber(1) }, record)).toBe(false);
    expect(bigNumberRecordEqual(record, record)).toBe(true);
  });

  it('tokenAmountsEqual compares tokens by reference, which the address book guarantees', () => {
    const other = { id: 'A' } as unknown as TokenEntity;
    const value = new BigNumber(1);
    expect(tokenAmountsEqual([amount(value)], [amount(value)])).toBe(true);
    expect(
      tokenAmountsEqual(
        [{ token, amount: value } as TokenAmount],
        [{ token: other, amount: value } as TokenAmount]
      )
    ).toBe(false);
  });
});
