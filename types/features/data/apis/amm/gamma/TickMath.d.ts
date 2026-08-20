import BigNumber from 'bignumber.js';
/**
 * Math library for computing sqrt prices from ticks
 * @see https://github.com/Uniswap/v3-core/blob/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb/contracts/libraries/TickMath.sol
 */
export declare class TickMath {
    static readonly MIN_TICK: bigint;
    static readonly MAX_TICK: bigint;
    static readonly MIN_SQRT_RATIO: bigint;
    static readonly MAX_SQRT_RATIO: bigint;
    static readonly Q32: bigint;
    static readonly Q96: bigint;
    static readonly Q160: bigint;
    static readonly Q256: bigint;
    static readonly MAX_UINT160: bigint;
    static readonly MAX_UINT256: bigint;
    /**
     * Calculates sqrt(1.0001^tick)
     * @param tick The input tick for the above formula
     */
    static getSqrtRatioAtTick(tick: BigNumber): BigNumber;
    /**
     * Calculates sqrt(1.0001^tick) * 2^96
     * @param tick The input tick for the above formula
     * @return Q128.96-encoded value
     * @protected
     */
    protected static getSqrtRatioAtTickInt(tick: bigint): bigint;
    protected static uint256(value: bigint): bigint;
    protected static uint160(value: bigint): bigint;
}
