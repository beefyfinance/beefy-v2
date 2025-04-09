import BigNumber from 'bignumber.js';

/**
 * Math library for computing sqrt prices from ticks
 * @see https://github.com/Uniswap/v3-core/blob/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb/contracts/libraries/TickMath.sol
 */
export class TickMath {
  // @dev The minimum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**-128
  public static readonly MIN_TICK: bigint = -887272n;
  // @dev The maximum tick that may be passed to #getSqrtRatioAtTick computed from log base 1.0001 of 2**128
  public static readonly MAX_TICK: bigint = -TickMath.MIN_TICK;
  // @dev The minimum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MIN_TICK)
  public static readonly MIN_SQRT_RATIO: bigint = 4295128739n;
  // @dev The maximum value that can be returned from #getSqrtRatioAtTick. Equivalent to getSqrtRatioAtTick(MAX_TICK)
  public static readonly MAX_SQRT_RATIO: bigint =
    1461446703485210103287273052203988822378723970342n;
  public static readonly Q32: bigint = 1n << 32n;
  public static readonly Q96: bigint = 1n << 96n;
  public static readonly Q160: bigint = 1n << 160n;
  public static readonly Q256: bigint = 1n << 256n;
  public static readonly MAX_UINT160: bigint = TickMath.Q160 - 1n;
  public static readonly MAX_UINT256: bigint = TickMath.Q256 - 1n;

  /**
   * Calculates sqrt(1.0001^tick)
   * @param tick The input tick for the above formula
   */
  public static getSqrtRatioAtTick(tick: BigNumber): BigNumber {
    const sqrtRatioX96 = TickMath.getSqrtRatioAtTickInt(BigInt(tick.toString(10)));
    // A Q.96 value is the numerator of the ratio where the denominator is always 2**96
    const sqrtRatio = new BigNumber(sqrtRatioX96.toString(10)).dividedBy(
      new BigNumber(TickMath.Q96.toString(10))
    );

    console.debug({
      tick: tick.toString(10),
      sqrtRatioX96: sqrtRatioX96.toString(10),
      sqrtRatio: sqrtRatio.toString(10),
    });

    return sqrtRatio;
  }

  /**
   * Calculates sqrt(1.0001^tick) * 2^96
   * @param tick The input tick for the above formula
   * @return Q128.96-encoded value
   * @protected
   */
  protected static getSqrtRatioAtTickInt(tick: bigint): bigint {
    const absTick = TickMath.uint256(tick < 0n ? -tick : tick);
    if (absTick > TickMath.MAX_TICK) {
      throw new Error('TickMath: T');
    }

    let ratio = TickMath.uint256(
      (absTick & 0x1n) !== 0n ?
        0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n
    );

    if ((absTick & 0x2n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xfff97272373d413259a46990580e213an) >> 128n);
    if ((absTick & 0x4n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n);
    if ((absTick & 0x8n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n);
    if ((absTick & 0x10n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n);
    if ((absTick & 0x20n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n);
    if ((absTick & 0x40n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n);
    if ((absTick & 0x80n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n);
    if ((absTick & 0x100n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n);
    if ((absTick & 0x200n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n);
    if ((absTick & 0x400n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n);
    if ((absTick & 0x800n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n);
    if ((absTick & 0x1000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n);
    if ((absTick & 0x2000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n);
    if ((absTick & 0x4000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n);
    if ((absTick & 0x8000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n);
    if ((absTick & 0x10000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n);
    if ((absTick & 0x20000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n);
    if ((absTick & 0x40000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n);
    if ((absTick & 0x80000n) !== 0n)
      ratio = TickMath.uint256((ratio * 0x48a170391f7dc42444e8fa2n) >> 128n);

    if (tick > 0n) ratio = TickMath.uint256(TickMath.MAX_UINT256 / ratio);

    return TickMath.uint160((ratio >> 32n) + (ratio % TickMath.Q32 === 0n ? 0n : 1n));
  }

  protected static uint256(value: bigint): bigint {
    return value & TickMath.MAX_UINT256;
  }

  protected static uint160(value: bigint): bigint {
    return value & TickMath.MAX_UINT160;
  }
}
