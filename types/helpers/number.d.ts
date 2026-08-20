export declare function compoundInterest(rate: number, principal?: number, periods?: number, times?: number): number;
export declare function compound(rate: number, principal?: number, periods?: number, times?: number): number;
export declare function percentDifference(a: number, b: number): number;
export declare class MovingAverage {
    private period;
    private values;
    constructor(period: number);
    add(value: number): this;
    get average(): number;
    next(value: number): number;
}
export declare function isFiniteNumber(x: unknown): x is number;
export declare const yearlyToDaily: (apy: number) => number;
export declare const clamp: (value: number, min: number, max: number) => number;
