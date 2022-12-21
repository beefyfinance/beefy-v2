import Web3 from 'web3';
import { AmmEntitySolidly } from '../../entities/amm';
import BigNumber from 'bignumber.js';
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { SolidlyPairAbi } from '../../../../config/abi';
import { ChainEntity } from '../../entities/chain';
import { createContract } from '../../../../helpers/web3';
import { getWeb3Instance } from '../instances';
import { BIG_ONE, BIG_ZERO, fromWei, toWei } from '../../../../helpers/big-number';
import {
  AddLiquidityRatio,
  AddLiquidityResult,
  IPool,
  RemoveLiquidityResult,
  SwapFeeParams,
  SwapResult,
  WANT_TYPE,
} from './types';

enum MetadataKeys {
  decimals0,
  decimals1,
  reserves0,
  reserves1,
  stable,
  token0,
  token1,
}

export type MetadataRaw = {
  0: string; // decimals0 (1e18 not 18)
  1: string; // decimals1
  2: string; // reserves0
  3: string; // reserves1
  4: boolean; // stable
  5: string; // token0
  6: string; // token1
};

export type PairDataResponse = {
  totalSupply: string;
  decimals: string;
  metadata: MetadataRaw;
};

export type PairData = {
  totalSupply: BigNumber;
  decimals: number;
  token0: string;
  token1: string;
  reserves0: BigNumber;
  reserves1: BigNumber;
  decimals0: number;
  decimals1: number;
  stable: boolean;
};

export type InOut = {
  reservesIn: BigNumber;
  reservesOut: BigNumber;
  decimalsIn: number;
  decimalsOut: number;
  tokenIn: string;
  tokenOut: string;
};

export type LiquidityAmounts = {
  amountA: BigNumber;
  amountB: BigNumber;
};

export class SolidlyPool implements IPool {
  public readonly type = 'solidly';

  protected pairData: PairData | null = null;
  private web3: Web3 | null = null;
  private multicall: MultiCall | null = null;

  constructor(
    protected address: string,
    protected amm: AmmEntitySolidly,
    protected chain: ChainEntity
  ) {}

  async getWeb3(): Promise<Web3> {
    if (this.web3 === null) {
      this.web3 = await getWeb3Instance(this.chain);
    }

    return this.web3;
  }

  async getMulticall(): Promise<MultiCall> {
    if (this.multicall === null) {
      this.multicall = new MultiCall(await this.getWeb3(), this.chain.multicallAddress);
    }

    return this.multicall;
  }

  protected getPairDataRequest(): ShapeWithLabel[] {
    const contract = createContract(SolidlyPairAbi, this.address);
    return [
      {
        totalSupply: contract.methods.totalSupply(),
        decimals: contract.methods.decimals(),
        metadata: contract.methods.metadata(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: any[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    this.pairData = {
      totalSupply: new BigNumber(result.totalSupply),
      decimals: parseInt(result.totalSupply, 10),
      token0: result.metadata[MetadataKeys.token0],
      token1: result.metadata[MetadataKeys.token1],
      reserves0: new BigNumber(result.metadata[MetadataKeys.reserves0]),
      reserves1: new BigNumber(result.metadata[MetadataKeys.reserves1]),
      decimals0: new BigNumber(result.metadata[MetadataKeys.decimals0]).e, // 1e18 -> 18
      decimals1: new BigNumber(result.metadata[MetadataKeys.decimals1]).e,
      stable: result.metadata[MetadataKeys.stable],
    };
  }

  async updatePairData() {
    const multicall = await this.getMulticall();
    const [results] = await multicall.all([this.getPairDataRequest()]);
    this.consumePairDataResponse(results);
  }

  async updateAllData(otherCalls: ShapeWithLabel[][] = []): Promise<any[][]> {
    const multicall = await this.getMulticall();
    const calls = [this.getPairDataRequest(), ...otherCalls];
    const [pairResults, ...otherResults] = await multicall.all(calls);

    this.consumePairDataResponse(pairResults);

    return otherResults;
  }

  removeLiquidity(amount: BigNumber, updateReserves: boolean = false): RemoveLiquidityResult {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { reserves0, reserves1, token0, token1, totalSupply } = this.pairData;
    const amount0 = amount.multipliedBy(reserves0).dividedToIntegerBy(totalSupply);
    const amount1 = amount.multipliedBy(reserves1).dividedToIntegerBy(totalSupply);

    if (amount0.lte(BIG_ZERO) || amount1.lte(BIG_ZERO)) {
      throw new Error('Insufficient liquidity burned');
    }

    if (updateReserves) {
      this.pairData.reserves0 = reserves0.minus(amount0);
      this.pairData.reserves1 = reserves1.minus(amount1);
    }

    return { amount0, amount1, token0, token1 };
  }

  addLiquidity(amountA: BigNumber, tokenA: string, amountB: BigNumber): AddLiquidityResult {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { reservesIn: reservesA, reservesOut: reservesB } = this.getInOut(tokenA);
    const { amountA: addAmountA, amountB: addAmountB } = this.getOptimalAddLiquidityAmounts(
      amountA,
      amountB,
      reservesA,
      reservesB
    );
    const returnedA = amountA.minus(addAmountA);
    const returnedB = amountB.minus(addAmountB);
    const totalSupply = this.pairData.totalSupply;

    let liquidity: BigNumber;

    if (totalSupply.isZero()) {
      liquidity = addAmountA.multipliedBy(addAmountB).squareRoot().minus(this.amm.minimumLiquidity);
    } else {
      liquidity = BigNumber.min(
        addAmountA.multipliedBy(totalSupply).dividedToIntegerBy(reservesA),
        addAmountB.multipliedBy(totalSupply).dividedToIntegerBy(reservesB)
      );
    }

    if (liquidity.lte(BIG_ZERO)) {
      throw new Error('Insufficient liquidity minted');
    }

    return {
      liquidity: liquidity.decimalPlaces(0, BigNumber.ROUND_FLOOR),
      addAmountA,
      addAmountB,
      returnedA,
      returnedB,
    };
  }

  swap(amountIn: BigNumber, tokenIn: string, updateReserves: boolean = false): SwapResult {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { reservesIn, reservesOut, decimalsIn, decimalsOut } = this.getInOut(tokenIn);
    const amountInAfterFee = this.getAmountInAfterFee(amountIn);
    const amountOut = this.getAmountOut(
      amountIn,
      reservesIn,
      reservesOut,
      decimalsIn,
      decimalsOut,
      this.pairData.stable
    );
    const priceImpact = this.calculatePriceImpact(
      amountInAfterFee,
      amountOut,
      reservesIn,
      reservesOut,
      decimalsIn,
      decimalsOut
    );
    const reservesInAfter = reservesIn.plus(amountIn);
    const reservesOutAfter = reservesOut.minus(amountOut);

    if (updateReserves) {
      const inIsToken0 = this.isToken0(tokenIn);
      this.pairData.reserves0 = inIsToken0 ? reservesInAfter : reservesOutAfter;
      this.pairData.reserves1 = inIsToken0 ? reservesOutAfter : reservesInAfter;
    }

    return {
      amountIn,
      amountInAfterFee,
      amountOut,
      reservesIn,
      reservesOut,
      reservesInAfter,
      reservesOutAfter,
      priceImpact,
    };
  }

  protected calculatePriceImpact(
    amountIn: BigNumber,
    amountOut: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber,
    decimalsIn: number,
    decimalsOut: number
  ): number {
    // swap a small sample amount, which won't suffer price impact
    // we use normalized 1e-9 to avoid rounder-to-zero errors due to differences in token decimals
    const sampleAmountIn = toWei(BIG_ONE.shiftedBy(-9), 18);
    const sampleAmountOut = this.quoteAmountOutNormalized(
      sampleAmountIn,
      this.normalize(reservesIn, decimalsIn),
      this.normalize(reservesOut, decimalsOut),
      this.pairData.stable
    );

    // normalize the swap amounts so we can compare to sample
    const swapAmountIn = this.normalize(amountIn, decimalsIn);
    const swapAmountOut = this.normalize(amountOut, decimalsOut);

    // decimal math from here on
    const swapPrice = swapAmountOut.dividedBy(swapAmountIn);
    const samplePrice = sampleAmountOut.dividedBy(sampleAmountIn);
    const ratio = BigNumber.min(swapPrice.dividedBy(samplePrice), BIG_ONE);

    return BIG_ONE.minus(ratio).toNumber();
  }

  getAddLiquidityRatio(amountIn: BigNumber): AddLiquidityRatio {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    if (this.pairData.stable) {
      return this.getAddLiquidityRatioStable(amountIn);
    }

    return this.getAddLiquidityRatioVolatile(amountIn);
  }

  protected getAddLiquidityRatioStable(amountIn: BigNumber): AddLiquidityRatio {
    const { reserves0, reserves1, decimals0, decimals1 } = this.pairData;
    const reserves0Normalized = this.normalize(reserves0, decimals0);
    const reserves1Normalized = this.normalize(reserves1, decimals1);

    const swapAmountA = toWei(BIG_ONE.shiftedBy(-9), 18);
    const swapAmountB = this.quoteAmountOutNormalized(
      swapAmountA,
      reserves0Normalized,
      reserves1Normalized,
      true
    );
    const { amountA, amountB } = this.getOptimalAddLiquidityAmounts(
      swapAmountA,
      swapAmountB,
      reserves0Normalized,
      reserves1Normalized
    );

    const ratioDenominator = swapAmountB
      .shiftedBy(18)
      .dividedToIntegerBy(swapAmountA)
      .multipliedBy(amountA)
      .dividedToIntegerBy(amountB)
      .plus(1e18);
    const ratioNumerator = new BigNumber('1e36');
    const ratio = ratioNumerator.dividedToIntegerBy(ratioDenominator);

    const amount0 = amountIn
      .multipliedBy(BIG_ONE.minus(fromWei(ratio, 18)))
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const amount1 = amountIn.minus(amount0);

    return {
      amount0,
      amount1,
    };
  }

  protected getAddLiquidityRatioVolatile(amountIn: BigNumber): AddLiquidityRatio {
    const amount0 = amountIn.dividedToIntegerBy(2);
    const amount1 = amountIn.minus(amount0);
    return {
      amount0,
      amount1,
    };
  }

  /**
   * @see BeefySolidlyZap.sol#_getSwapAmount
   */
  getOptimalSwapAmount(fullAmountIn: BigNumber, tokenIn: string): BigNumber {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    if (this.pairData.stable) {
      return this.getOptimalSwapAmountStable(fullAmountIn, tokenIn);
    }

    return this.getOptimalSwapAmountVolatile(fullAmountIn, tokenIn);
  }

  /**
   * @see BeefySolidlyZap.sol#_getStableSwap
   */
  getOptimalSwapAmountStable(fullAmountIn: BigNumber, tokenIn: string): BigNumber {
    const { reservesIn, reservesOut, decimalsIn, decimalsOut } = this.getInOut(tokenIn);
    const halfAmountIn = fullAmountIn.dividedToIntegerBy(2);
    const swapAmountOut = this.getAmountOut(
      halfAmountIn,
      reservesIn,
      reservesOut,
      decimalsIn,
      decimalsOut,
      true
    );
    const { amountA, amountB } = this.getOptimalAddLiquidityAmounts(
      halfAmountIn,
      swapAmountOut,
      reservesIn,
      reservesOut
    );

    const amountANormalized = this.normalize(amountA, decimalsIn);
    const amountBNormalized = this.normalize(amountB, decimalsOut);
    const swapAmountOutNormalized = this.normalize(swapAmountOut, decimalsOut);
    const halfAmountInNormalized = this.normalize(halfAmountIn, decimalsIn);

    const ratio = swapAmountOutNormalized
      .shiftedBy(18)
      .dividedToIntegerBy(halfAmountInNormalized)
      .multipliedBy(amountANormalized)
      .dividedToIntegerBy(amountBNormalized);

    return fullAmountIn.shiftedBy(18).dividedToIntegerBy(ratio.plus(1e18));
  }

  getOptimalSwapAmountVolatile(fullAmountIn: BigNumber, tokenIn: string): BigNumber {
    const { reservesIn, reservesOut, decimalsIn, decimalsOut } = this.getInOut(tokenIn);
    const halfAmountIn = fullAmountIn.dividedToIntegerBy(2);
    const nominator = this.getAmountOut(
      halfAmountIn,
      reservesIn,
      reservesOut,
      decimalsIn,
      decimalsOut,
      false
    );
    const denominator = this.quoteLiquidity(
      halfAmountIn,
      reservesIn.plus(halfAmountIn),
      reservesOut.minus(nominator)
    );

    return fullAmountIn.minus(
      halfAmountIn
        .multipliedBy(halfAmountIn)
        .multipliedBy(nominator)
        .dividedToIntegerBy(denominator)
    );
  }

  /**
   * @see BaseV1Pair.sol#getAmountOut
   */
  protected getAmountOut(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber,
    decimalsIn: number,
    decimalsOut: number,
    stable: boolean
  ): BigNumber {
    const amountInAfterFee = this.getAmountInAfterFee(amountIn);
    return this.quoteAmountOut(
      amountInAfterFee,
      reservesIn,
      reservesOut,
      decimalsIn,
      decimalsOut,
      stable
    );
  }

  protected getSwapFeeParams(): SwapFeeParams {
    return {
      numerator: new BigNumber(this.amm.swapFeeNumerator),
      denominator: new BigNumber(this.amm.swapFeeDenominator),
    };
  }

  protected getAmountInAfterFee(amountIn: BigNumber): BigNumber {
    const { numerator, denominator } = this.getSwapFeeParams();

    return amountIn.multipliedBy(denominator.minus(numerator)).dividedToIntegerBy(denominator);
  }

  /**
   * @see BaseV1Pair.sol#_getAmountOut
   */
  protected quoteAmountOut(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber,
    decimalsIn: number,
    decimalsOut: number,
    stable: boolean
  ): BigNumber {
    if (stable) {
      return this.quoteAmountOutStable(amountIn, reservesIn, reservesOut, decimalsIn, decimalsOut);
    }

    return this.quoteAmountOutVolatile(amountIn, reservesIn, reservesOut);
  }

  protected quoteAmountOutVolatile(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber
  ): BigNumber {
    return amountIn.multipliedBy(reservesOut).dividedToIntegerBy(reservesIn.plus(amountIn));
  }

  protected quoteAmountOutStable(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber,
    decimalsIn: number,
    decimalsOut: number
  ): BigNumber {
    const reservesInNormalized = this.normalize(reservesIn, decimalsIn);
    const reservesOutNormalized = this.normalize(reservesOut, decimalsOut);
    const amountInNormalized = this.normalize(amountIn, decimalsIn);

    const amountOutNormalized = this.quoteAmountOutStableNormalized(
      amountInNormalized,
      reservesInNormalized,
      reservesOutNormalized
    );

    return amountOutNormalized
      .shiftedBy(decimalsOut)
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  }

  protected quoteAmountOutNormalized(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber,
    stable: boolean
  ): BigNumber {
    if (stable) {
      return this.quoteAmountOutStableNormalized(amountIn, reservesIn, reservesOut);
    }

    return this.quoteAmountOutVolatile(amountIn, reservesIn, reservesOut);
  }

  protected quoteAmountOutStableNormalized(
    amountInNormalized: BigNumber,
    reservesInNormalized: BigNumber,
    reservesOutNormalized: BigNumber
  ): BigNumber {
    const xy = this.getStableKNormalized(reservesInNormalized, reservesOutNormalized);
    const y = this.getY(reservesInNormalized.plus(amountInNormalized), xy, reservesOutNormalized);

    return reservesOutNormalized.minus(y);
  }

  /**
   * Shifts the amount from the given decimals to 18 decimals.
   */
  protected normalize(amount: BigNumber, decimals: number): BigNumber {
    return amount.shiftedBy(18).shiftedBy(-decimals);
  }

  /**
   * @see BaseV1Pair.sol#_k
   */
  protected getK(
    reserves0: BigNumber,
    reserves1: BigNumber,
    decimals0: number,
    decimals1: number,
    stable: boolean
  ): BigNumber {
    if (stable) {
      // x^3*y + y^3*x >= k
      return this.getStableK(reserves0, reserves1, decimals0, decimals1);
    }

    // xy >= k
    return this.getVolatileK(reserves0, reserves1);
  }

  protected getStableK(
    reserves0: BigNumber,
    reserves1: BigNumber,
    decimals0: number,
    decimals1: number
  ): BigNumber {
    // x^3*y + y^3*x >= k
    const x = this.normalize(reserves0, decimals0);
    const y = this.normalize(reserves1, decimals1);
    return this.getStableKNormalized(x, y);
  }

  protected getStableKNormalized(x: BigNumber, y: BigNumber): BigNumber {
    // x^3*y + y^3*x >= k
    const a = x.multipliedBy(y).shiftedBy(-18).decimalPlaces(0, BigNumber.ROUND_FLOOR); // (xy)
    const b = x
      .multipliedBy(x)
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
      .plus(y.multipliedBy(y).shiftedBy(-18).decimalPlaces(0, BigNumber.ROUND_FLOOR)); // (x^2 + y^2)
    return a.multipliedBy(b).shiftedBy(-18).decimalPlaces(0, BigNumber.ROUND_FLOOR); // (xy)(x^2 + y^2)
  }

  protected getVolatileK(reserves0: BigNumber, reserves1: BigNumber) {
    // xy >= k
    return reserves0.multipliedBy(reserves1).decimalPlaces(0, BigNumber.ROUND_FLOOR);
  }

  /**
   * This uses newton's method to approximate the y value that satisfies the equation x^3*y + y^3*x >= k
   * @see BaseV1Pair.sol#_get_y
   */
  protected getY(x0: BigNumber, xy: BigNumber, y: BigNumber): BigNumber {
    for (let i = 0; i < 255; ++i) {
      const y_prev = y;
      const k = this.getF(x0, y);
      const d = this.getD(x0, y);

      if (k.lt(xy)) {
        const dy = xy.minus(k).shiftedBy(18).dividedToIntegerBy(d);
        y = y.plus(dy);
      } else {
        const dy = k.minus(xy).shiftedBy(18).dividedToIntegerBy(d);
        y = y.minus(dy);
      }

      if (y.gt(y_prev)) {
        if (y.minus(y_prev).lte(1)) {
          return y;
        }
      } else {
        if (y_prev.minus(y).lte(1)) {
          return y;
        }
      }
    }

    return y;
  }

  /**
   * @see BaseV1Pair.sol#_f
   */
  protected getF(x0: BigNumber, y: BigNumber): BigNumber {
    // x0*(y*y/1e18*y/1e18)/1e18
    const xp = x0
      .multipliedBy(
        y
          .multipliedBy(y)
          .shiftedBy(-18)
          .decimalPlaces(0, BigNumber.ROUND_FLOOR)
          .multipliedBy(y)
          .shiftedBy(-18)
          .decimalPlaces(0, BigNumber.ROUND_FLOOR)
      )
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    // (x0*x0/1e18*x0/1e18)*y/1e18
    const yp = x0
      .multipliedBy(x0)
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
      .multipliedBy(x0)
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
      .multipliedBy(y)
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);

    return xp.plus(yp);
  }

  /**
   * @see BaseV1Pair.sol#_d
   */
  protected getD(x0: BigNumber, y: BigNumber): BigNumber {
    // 3*x0*(y*y/1e18)/1e18
    const xp = new BigNumber(3)
      .multipliedBy(x0)
      .multipliedBy(y.multipliedBy(y).shiftedBy(-18).decimalPlaces(0, BigNumber.ROUND_FLOOR))
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    // (x0*x0/1e18*x0/1e18)
    const yp = x0
      .multipliedBy(x0)
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR)
      .multipliedBy(x0)
      .shiftedBy(-18)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    return xp.plus(yp);
  }

  protected getInOut(tokenIn: string): InOut {
    const inIsToken0 = this.isToken0(tokenIn);
    return {
      reservesIn: inIsToken0 ? this.pairData.reserves0 : this.pairData.reserves1,
      reservesOut: inIsToken0 ? this.pairData.reserves1 : this.pairData.reserves0,
      decimalsIn: inIsToken0 ? this.pairData.decimals0 : this.pairData.decimals1,
      decimalsOut: inIsToken0 ? this.pairData.decimals1 : this.pairData.decimals0,
      tokenIn: inIsToken0 ? this.pairData.token0 : this.pairData.token1,
      tokenOut: inIsToken0 ? this.pairData.token1 : this.pairData.token0,
    };
  }

  protected isToken0(token: string): boolean {
    return this.pairData.token0.toLowerCase() === token.toLowerCase();
  }

  /**
   * @see BaseV1Router01.sol#_addLiquidity
   */
  protected getOptimalAddLiquidityAmounts(
    amountA: BigNumber,
    amountB: BigNumber,
    reserveA: BigNumber,
    reserveB: BigNumber
  ): LiquidityAmounts {
    if (reserveA.isZero() && reserveB.isZero()) {
      return { amountA, amountB };
    }

    const optimalAmountB = this.quoteLiquidity(amountA, reserveA, reserveB);
    if (optimalAmountB.lte(amountB)) {
      return {
        amountA: amountA,
        amountB: optimalAmountB,
      };
    }

    const optimalAmountA = this.quoteLiquidity(amountB, reserveB, reserveA);
    return {
      amountA: optimalAmountA,
      amountB: amountB,
    };
  }

  protected quoteLiquidity(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber
  ): BigNumber {
    return amountIn.multipliedBy(reservesOut).dividedToIntegerBy(reservesIn);
  }

  getWantType(): WANT_TYPE {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    return this.pairData.stable ? WANT_TYPE.SOLIDLY_STABLE : WANT_TYPE.SOLIDLY_VOLATILE;
  }
}
