import type BigNumber from 'bignumber.js';
import { toBigNumber } from './big-number.ts';
import { createFactory } from '../features/data/utils/factory-utils.ts';

type NumberMathValue<TValue> = TValue | number;

interface INumberMath<TValue> {
  mul(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
  div(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
  add(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
  sub(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
  toString(value: TValue): string;
}

export class NumberMath implements INumberMath<number> {
  public mul(value: NumberMathValue<number>, by: NumberMathValue<number>): number {
    return value * by;
  }

  public div(value: NumberMathValue<number>, by: NumberMathValue<number>): number {
    return value / by;
  }

  public add(value: NumberMathValue<number>, by: NumberMathValue<number>): number {
    return value + by;
  }

  public sub(value: NumberMathValue<number>, by: NumberMathValue<number>): number {
    return value - by;
  }

  public toString(value: number): string {
    return value.toString();
  }
}

export class BigNumberMath implements INumberMath<BigNumber> {
  public mul(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber {
    return toBigNumber(value).times(by);
  }

  public div(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber {
    return toBigNumber(value).div(by);
  }

  public add(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber {
    return toBigNumber(value).plus(by);
  }

  public sub(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber {
    return toBigNumber(value).minus(by);
  }

  public toString(value: BigNumber): string {
    return value.toString(10);
  }
}

export const getNumberMath = createFactory(() => new NumberMath());

export const getBigNumberMath = createFactory(() => new BigNumberMath());

export interface Interpolator<TValue> {
  interpolate(t: number, t0: number, t1: number, v0: TValue, v1: TValue): TValue;
  toString(value: TValue): string;
}

export class MathInterpolator<TValue> implements Interpolator<TValue> {
  constructor(protected math: INumberMath<TValue>) {}

  interpolate(t: number, t0: number, t1: number, v0: TValue, v1: TValue): TValue {
    const r0 = t1 - t;
    const r1 = t - t0;
    const d = t1 - t0;
    return this.math.div(this.math.add(this.math.mul(v0, r0), this.math.mul(v1, r1)), d);
  }

  toString(value: TValue): string {
    return this.math.toString(value);
  }
}

export const getNumberInterpolator = createFactory(() => new MathInterpolator(getNumberMath()));
export const getBigNumberInterpolator = createFactory(
  () => new MathInterpolator(getBigNumberMath())
);
