import type BigNumber from 'bignumber.js';
type NumberMathValue<TValue> = TValue | number;
interface INumberMath<TValue> {
    mul(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
    div(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
    add(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
    sub(value: NumberMathValue<TValue>, by: NumberMathValue<TValue>): TValue;
    toString(value: TValue): string;
}
export declare class NumberMath implements INumberMath<number> {
    mul(value: NumberMathValue<number>, by: NumberMathValue<number>): number;
    div(value: NumberMathValue<number>, by: NumberMathValue<number>): number;
    add(value: NumberMathValue<number>, by: NumberMathValue<number>): number;
    sub(value: NumberMathValue<number>, by: NumberMathValue<number>): number;
    toString(value: number): string;
}
export declare class BigNumberMath implements INumberMath<BigNumber> {
    mul(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber;
    div(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber;
    add(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber;
    sub(value: NumberMathValue<BigNumber>, by: NumberMathValue<BigNumber>): BigNumber;
    toString(value: BigNumber): string;
}
export declare const getNumberMath: (...props: never[]) => NumberMath;
export declare const getBigNumberMath: (...props: never[]) => BigNumberMath;
export interface Interpolator<TValue> {
    interpolate(t: number, t0: number, t1: number, v0: TValue, v1: TValue): TValue;
    toString(value: TValue): string;
}
export declare class MathInterpolator<TValue> implements Interpolator<TValue> {
    protected math: INumberMath<TValue>;
    constructor(math: INumberMath<TValue>);
    interpolate(t: number, t0: number, t1: number, v0: TValue, v1: TValue): TValue;
    toString(value: TValue): string;
}
export declare const getNumberInterpolator: (...props: never[]) => MathInterpolator<number>;
export declare const getBigNumberInterpolator: (...props: never[]) => MathInterpolator<BigNumber>;
export {};
