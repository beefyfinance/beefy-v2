import BigNumber from 'bignumber.js';
export declare class FixedPoint {
    static readonly ONE: BigNumber;
    private constructor();
    static mulDown(a: BigNumber, b: BigNumber): BigNumber;
    static mulUp(a: BigNumber, b: BigNumber): BigNumber;
    static divDown(a: BigNumber, b: BigNumber): BigNumber;
    static divUp(a: BigNumber, b: BigNumber): BigNumber;
    static powDown(base: BigNumber, exponent: BigNumber): BigNumber;
}
