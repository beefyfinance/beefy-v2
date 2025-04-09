import BigNumber from 'bignumber.js';
import { SolidlyPairAbi } from '../../../../../config/abi/SolidlyPairAbi.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import {
  BIG_ONE,
  BIG_ZERO,
  bigNumberToBigInt,
  fromWei,
  toWei,
} from '../../../../../helpers/big-number.ts';
import type {
  AddLiquidityRatio,
  AddLiquidityResult,
  IUniswapLikePool,
  RemoveLiquidityResult,
  SwapFeeParams,
  SwapResult,
} from '../types.ts';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types.ts';
import type { TokenAmount } from '../../transact/transact-types.ts';
import { slipAllBy, slipBy } from '../../transact/helpers/amounts.ts';
import { isTokenNative, type TokenEntity } from '../../../entities/token.ts';
import { getInsertIndex } from '../../transact/helpers/zap.ts';
import type { AmmEntitySolidly } from '../../../entities/zap.ts';
import { onlyOneTokenAmount } from '../../transact/helpers/options.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';

export enum MetadataKeys {
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

export class SolidlyPool implements IUniswapLikePool {
  public readonly type = 'solidly';

  protected pairData: PairData | undefined = undefined;

  constructor(
    protected address: string,
    protected amm: AmmEntitySolidly,
    protected chain: ChainEntity
  ) {}

  protected async updatePairData() {
    const contract = fetchContract(this.address, SolidlyPairAbi, this.chain.id);
    const [
      totalSupply,
      decimals,
      [decimal0, decimal1, reserves0, reserves1, stable, token0, token1],
    ] = await Promise.all([
      contract.read.totalSupply(),
      contract.read.decimals(),
      contract.read.metadata(),
    ]);

    this.pairData = {
      totalSupply: new BigNumber(totalSupply.toString(10)),
      decimals: decimals,
      token0: token0,
      token1: token1,
      reserves0: new BigNumber(reserves0.toString(10)),
      reserves1: new BigNumber(reserves1.toString(10)),
      decimals0: new BigNumber(decimal0.toString(10)).e!, // 1e18 -> 18
      decimals1: new BigNumber(decimal1.toString(10)).e!,
      stable: stable,
    };
  }

  async updateAllData() {
    // For solidly pools we just update pair data on the base pool.
    await this.updatePairData();
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
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

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
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

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
   * Optimal swap amount when swapping tokenIn to tokenOut via the pool such that after the swap
   *  the amount of tokenIn/Out is in the correct ratio for adding liquidity.
   * Only works when swapping through the pool, otherwise use getAddLiquidityRatio
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
        .squareRoot()
        .decimalPlaces(0, BigNumber.ROUND_FLOOR)
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
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

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
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    return this.pairData.token0.toLowerCase() === token.toLowerCase();
  }

  protected isTokenInPair(token: TokenEntity): boolean {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    if (isTokenNative(token)) {
      return false;
    }

    return (
      this.pairData.token0.toLowerCase() === token.address.toLowerCase() ||
      this.pairData.token1.toLowerCase() === token.address.toLowerCase()
    );
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

  protected buildZapSwapTx(
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    routes: { from: string; to: string }[],
    to: string,
    deadline: number,
    insertBalance: boolean
  ): ZapStep {
    const pairData = this.pairData;
    if (!pairData) {
      throw new Error('Pair data is not loaded');
    }

    return {
      target: this.amm.routerAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'swapExactTokensForTokens',
            constant: false,
            payable: false,
            inputs: [
              { type: 'uint256', name: 'amountIn' },
              {
                type: 'uint256',
                name: 'amountOutMin',
              },
              {
                type: 'tuple[]',
                name: 'routes',
                components: [
                  { type: 'address', name: 'from' },
                  { type: 'address', name: 'to' },
                  {
                    type: 'bool',
                    name: 'stable',
                  },
                ],
              },
              { type: 'address', name: 'to' },
              { type: 'uint256', name: 'deadline' },
            ],
            outputs: [{ type: 'uint256[]', name: 'amounts' }],
            stateMutability: 'nonpayable',
          },
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(amountIn),
          bigNumberToBigInt(amountOutMin),
          routes.map(({ from, to }) => ({
            from: from as Address,
            to: to as Address,
            stable: pairData.stable,
          })),
          to as Address,
          BigInt(deadline),
        ],
      }),
      tokens: [
        {
          token: routes[0].from,
          index: insertBalance ? getInsertIndex(0) : -1, // amountIn
        },
      ],
    };
  }

  async getZapSwap(request: ZapStepRequest): Promise<ZapStepResponse> {
    const { inputs, outputs, maxSlippage, zapRouter, insertBalance } = request;
    const input = onlyOneTokenAmount(inputs);
    const output = onlyOneTokenAmount(outputs);

    if (!this.isTokenInPair(input.token) || !this.isTokenInPair(output.token)) {
      throw new Error('Invalid token');
    }

    const minOutput: TokenAmount = {
      token: output.token,
      amount: slipBy(output.amount, maxSlippage, output.token.decimals),
    };
    const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes

    return {
      inputs,
      outputs,
      minOutputs: [minOutput],
      returned: [],
      zaps: [
        this.buildZapSwapTx(
          toWei(input.amount, input.token.decimals),
          toWei(minOutput.amount, minOutput.token.decimals),
          [{ from: input.token.address, to: output.token.address }],
          zapRouter,
          deadline,
          insertBalance
        ),
      ],
    };
  }

  protected buildZapAddLiquidityTx(
    tokenA: string,
    tokenB: string,
    stable: boolean,
    amountADesired: BigNumber,
    amountBDesired: BigNumber,
    amountAMin: BigNumber,
    amountBMin: BigNumber,
    to: string,
    deadline: number,
    insertBalance: boolean
  ): ZapStep {
    return {
      target: this.amm.routerAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'addLiquidity',
            constant: false,
            payable: false,
            inputs: [
              { type: 'address', name: 'tokenA' },
              { type: 'address', name: 'tokenB' },
              {
                type: 'bool',
                name: 'stable',
              },
              { type: 'uint256', name: 'amountADesired' },
              {
                type: 'uint256',
                name: 'amountBDesired',
              },
              { type: 'uint256', name: 'amountAMin' },
              {
                type: 'uint256',
                name: 'amountBMin',
              },
              { type: 'address', name: 'to' },
              { type: 'uint256', name: 'deadline' },
            ],
            outputs: [
              { type: 'uint256', name: 'amountA' },
              {
                type: 'uint256',
                name: 'amountB',
              },
              { type: 'uint256', name: 'liquidity' },
            ],
            stateMutability: 'nonpayable',
          },
        ] as const satisfies Abi,
        args: [
          tokenA as Address,
          tokenB as Address,
          stable,
          bigNumberToBigInt(amountADesired),
          bigNumberToBigInt(amountBDesired),
          bigNumberToBigInt(amountAMin),
          bigNumberToBigInt(amountBMin),
          to as Address,
          BigInt(deadline),
        ],
      }),
      tokens: [
        {
          token: tokenA,
          index: insertBalance ? getInsertIndex(3) : -1, // amountADesired
        },
        {
          token: tokenB,
          index: insertBalance ? getInsertIndex(4) : -1, // amountBDesired
        },
      ],
    };
  }

  async getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { inputs, outputs, maxSlippage, zapRouter, insertBalance } = request;

    if (inputs.length !== 2) {
      throw new Error('Invalid inputs');
    }

    for (const input of inputs) {
      if (!this.isTokenInPair(input.token)) {
        throw new Error('Invalid token');
      }
    }

    const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes

    return {
      inputs,
      outputs,
      minOutputs: slipAllBy(outputs, maxSlippage),
      returned: [],
      zaps: [
        this.buildZapAddLiquidityTx(
          inputs[0].token.address,
          inputs[1].token.address,
          this.pairData.stable,
          toWei(inputs[0].amount, inputs[0].token.decimals),
          toWei(inputs[1].amount, inputs[1].token.decimals),
          toWei(
            slipBy(inputs[0].amount, maxSlippage, inputs[0].token.decimals),
            inputs[0].token.decimals
          ),
          toWei(
            slipBy(inputs[1].amount, maxSlippage, inputs[1].token.decimals),
            inputs[1].token.decimals
          ),
          zapRouter,
          deadline,
          insertBalance
        ),
      ],
    };
  }

  protected buildZapRemoveLiquidityTx(
    tokenA: string,
    tokenB: string,
    stable: boolean,
    liquidity: BigNumber,
    amountAMin: BigNumber,
    amountBMin: BigNumber,
    to: string,
    deadline: number,
    insertBalance: boolean
  ): ZapStep {
    return {
      target: this.amm.routerAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'removeLiquidity',
            constant: false,
            payable: false,
            inputs: [
              { type: 'address', name: 'tokenA' },
              { type: 'address', name: 'tokenB' },
              {
                type: 'bool',
                name: 'stable',
              },
              { type: 'uint256', name: 'liquidity' },
              {
                type: 'uint256',
                name: 'amountAMin',
              },
              { type: 'uint256', name: 'amountBMin' },
              { type: 'address', name: 'to' },
              {
                type: 'uint256',
                name: 'deadline',
              },
            ],
            outputs: [
              { type: 'uint256', name: 'amountA' },
              { type: 'uint256', name: 'amountB' },
            ],
            stateMutability: 'nonpayable',
          },
        ] as const satisfies Abi,
        args: [
          tokenA as Address,
          tokenB as Address,
          stable,
          bigNumberToBigInt(liquidity),
          bigNumberToBigInt(amountAMin),
          bigNumberToBigInt(amountBMin),
          to as Address,
          BigInt(deadline),
        ],
      }),
      tokens: [
        {
          token: this.address,
          index: insertBalance ? getInsertIndex(3) : -1, // liquidity
        },
      ],
    };
  }

  async getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { inputs, outputs, maxSlippage, zapRouter, insertBalance } = request;

    const input = onlyOneTokenAmount(inputs);
    if (this.address.toLowerCase() !== input.token.address.toLowerCase()) {
      throw new Error('Invalid input token');
    }

    if (outputs.length !== 2) {
      throw new Error('Invalid output count');
    }

    for (const output of outputs) {
      if (!this.isTokenInPair(output.token)) {
        throw new Error('Invalid output token');
      }
    }

    const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes
    const minOutputs = slipAllBy(outputs, maxSlippage);

    return {
      inputs,
      outputs,
      minOutputs,
      returned: [],
      zaps: [
        this.buildZapRemoveLiquidityTx(
          outputs[0].token.address,
          outputs[1].token.address,
          this.pairData.stable,
          toWei(input.amount, input.token.decimals),
          toWei(minOutputs[0].amount, minOutputs[0].token.decimals),
          toWei(minOutputs[1].amount, minOutputs[1].token.decimals),
          zapRouter,
          deadline,
          insertBalance
        ),
      ],
    };
  }
}
