import BigNumber from 'bignumber.js';
import { UniswapV2FactoryAbi } from '../../../../../config/abi/UniswapV2FactoryAbi.ts';
import { UniswapV2PairAbi } from '../../../../../config/abi/UniswapV2PairAbi.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import { ZERO_ADDRESS } from '../../../../../helpers/addresses.ts';
import { BIG_ZERO, bigNumberToBigInt, toWei } from '../../../../../helpers/big-number.ts';
import type {
  AddLiquidityRatio,
  AddLiquidityResult,
  IUniswapLikePool,
  RemoveLiquidityResult,
  SwapFeeParams,
  SwapResult,
} from '../types.ts';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types.ts';
import { getInsertIndex } from '../../transact/helpers/zap.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import { isTokenNative } from '../../../entities/token.ts';
import type { TokenAmount } from '../../transact/transact-types.ts';
import { slipAllBy, slipBy } from '../../transact/helpers/amounts.ts';
import type { AmmEntityUniswapV2 } from '../../../entities/zap.ts';
import { onlyOneTokenAmount } from '../../transact/helpers/options.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';

export type PairDataResponse = {
  totalSupply: string;
  decimals: string;
  token0: string;
  token1: string;
  reserves: Record<number, string>;
  kLast: string;
};

export type PairData = {
  totalSupply: BigNumber;
  decimals: number;
  token0: string;
  token1: string;
  reserves0: BigNumber;
  reserves1: BigNumber;
  kLast: BigNumber;
};

export type FactoryDataResponse = {
  feeTo: string;
};

export type FactoryData = FactoryDataResponse;

export type ReservesInOut = {
  reservesIn: BigNumber;
  reservesOut: BigNumber;
};

export type LiquidityAmounts = {
  amountA: BigNumber;
  amountB: BigNumber;
};

export type MintFeeResult = {
  feeOn: boolean;
  liquidityMinted: BigNumber;
  newTotalSupply: BigNumber;
};

export type MintFeeParams = {
  feeOn: boolean;
  numerator: BigNumber;
  denominator: BigNumber;
};

export class UniswapV2Pool implements IUniswapLikePool {
  public readonly type = 'uniswap-v2';

  protected pairData: PairData | undefined = undefined;
  protected factoryData: FactoryData | undefined = undefined;

  constructor(
    protected address: string,
    protected amm: AmmEntityUniswapV2,
    protected chain: ChainEntity
  ) {}

  protected async updatePairData() {
    const contract = fetchContract(this.address, UniswapV2PairAbi, this.chain.id);
    const [totalSupply, decimals, token0, token1, reserves, kLast] = await Promise.all([
      contract.read.totalSupply(),
      contract.read.decimals(),
      contract.read.token0(),
      contract.read.token1(),
      contract.read.getReserves(),
      contract.read.kLast(),
    ]);

    this.pairData = {
      totalSupply: new BigNumber(totalSupply.toString(10)),
      decimals: decimals,
      token0: token0,
      token1: token1,
      reserves0: new BigNumber(reserves[0].toString(10)),
      reserves1: new BigNumber(reserves[1].toString(10)),
      kLast: new BigNumber(kLast.toString(10)),
    };
  }

  protected async updateFactoryData() {
    const contract = fetchContract(this.amm.factoryAddress, UniswapV2FactoryAbi, this.chain.id);
    const feeTo = await contract.read.feeTo();
    this.factoryData = {
      feeTo: feeTo || ZERO_ADDRESS,
    };
  }

  async updateAllData() {
    //This consists of 2 updates
    // 1- update pairData
    // 2- update factory Data

    // Each pool will implement the combination of these 2 methods
    // update Pair data -> combination of both getPairDataRequest and consumePairDataResponse
    // update Factory data -> combination of both getFactoryDataRequest and consumeFactoryDataResponse

    // In certain cases we need to update only one of them, in that case we will call the respective method by overriding this
    await Promise.all([this.updatePairData(), this.updateFactoryData()]);
  }

  removeLiquidity(amount: BigNumber, updateReserves: boolean = false): RemoveLiquidityResult {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { reserves0, reserves1, token0, token1 } = this.pairData;
    const { newTotalSupply } = this.getMintFee();
    const amount0 = amount.multipliedBy(reserves0).dividedToIntegerBy(newTotalSupply);
    const amount1 = amount.multipliedBy(reserves1).dividedToIntegerBy(newTotalSupply);

    if (amount0.lte(BIG_ZERO) || amount1.lte(BIG_ZERO)) {
      throw new Error('Insufficient liquidity burned');
    }

    if (updateReserves) {
      this.pairData.reserves0 = reserves0.minus(amount0);
      this.pairData.reserves1 = reserves1.minus(amount1);
      this.pairData.totalSupply = newTotalSupply;
    }

    return { amount0, amount1, token0, token1 };
  }

  addLiquidity(amountA: BigNumber, tokenA: string, amountB: BigNumber): AddLiquidityResult {
    console.log('addLiquidity', amountA.toString(10), tokenA, amountB.toString(10));
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { reservesIn: reservesA, reservesOut: reservesB } = this.getReservesInOut(tokenA);
    const { amountA: addAmountA, amountB: addAmountB } = this.getOptimalAddLiquidityAmounts(
      amountA,
      amountB,
      reservesA,
      reservesB
    );
    const returnedA = amountA.minus(addAmountA);
    const returnedB = amountB.minus(addAmountB);
    const { newTotalSupply } = this.getMintFee();

    let liquidity: BigNumber;

    if (newTotalSupply.isZero()) {
      liquidity = addAmountA.multipliedBy(addAmountB).squareRoot().minus(this.amm.minimumLiquidity);
    } else {
      liquidity = BigNumber.min(
        addAmountA.multipliedBy(newTotalSupply).dividedToIntegerBy(reservesA),
        addAmountB.multipliedBy(newTotalSupply).dividedToIntegerBy(reservesB)
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

  protected getMintFeeParams(): MintFeeParams {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    return {
      feeOn: this.factoryData.feeTo !== ZERO_ADDRESS,
      numerator: new BigNumber(this.amm.mintFeeNumerator),
      denominator: new BigNumber(this.amm.mintFeeDenominator),
    };
  }

  protected getMintFee(): MintFeeResult {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }
    if (!this.factoryData) {
      throw new Error('Factory data is not loaded');
    }

    const { feeOn, numerator, denominator } = this.getMintFeeParams();
    const { kLast, totalSupply, reserves0, reserves1 } = this.pairData;

    if (
      !feeOn ||
      kLast.isZero() ||
      reserves0.isZero() ||
      reserves1.isZero() ||
      totalSupply.isZero()
    ) {
      return {
        feeOn,
        liquidityMinted: BIG_ZERO,
        newTotalSupply: totalSupply,
      };
    }

    const liquidityMinted = this.calculateMintFee(
      reserves0,
      reserves1,
      totalSupply,
      kLast,
      numerator,
      denominator
    );

    return {
      feeOn,
      liquidityMinted,
      newTotalSupply: totalSupply.plus(liquidityMinted),
    };
  }

  protected calculateMintFee(
    reserves0: BigNumber,
    reserves1: BigNumber,
    totalSupply: BigNumber,
    kLast: BigNumber,
    feeNumerator: BigNumber,
    feeDenominator: BigNumber
  ): BigNumber {
    const rootK = reserves0
      .multipliedBy(reserves1)
      .squareRoot()
      .decimalPlaces(0, BigNumber.ROUND_FLOOR);
    const rootKLast = kLast.squareRoot().decimalPlaces(0, BigNumber.ROUND_FLOOR);

    if (rootK <= rootKLast) {
      return BIG_ZERO;
    }

    const numerator = totalSupply.multipliedBy(rootK.minus(rootKLast)).multipliedBy(feeNumerator);
    const denominator = rootK
      .multipliedBy(feeDenominator)
      .decimalPlaces(0, BigNumber.ROUND_FLOOR) // ApeSwap has rootK/3, Swapsicle has rooK*17/3
      .plus(rootKLast.multipliedBy(feeNumerator));

    return numerator.dividedToIntegerBy(denominator);
  }

  swap(amountIn: BigNumber, tokenIn: string, updateReserves: boolean = false): SwapResult {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const { reservesIn, reservesOut } = this.getReservesInOut(tokenIn);
    const amountInAfterFee = this.getAmountInAfterFee(amountIn);
    const amountOut = this.getAmountOut(amountIn, reservesIn, reservesOut);
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
      priceImpact: amountInAfterFee.dividedBy(reservesIn.plus(amountInAfterFee)).toNumber(),
    };
  }

  getAddLiquidityRatio(amountIn: BigNumber): AddLiquidityRatio {
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

    const { reservesIn, reservesOut } = this.getReservesInOut(tokenIn);
    const halfAmountIn = fullAmountIn.dividedToIntegerBy(2);
    const nominator = this.getAmountOut(halfAmountIn, reservesIn, reservesOut);
    const denominator = this.quoteAmountOut(
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
   * @see UniswapV2Library.sol#getAmountOut
   */
  protected getAmountOut(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber
  ): BigNumber {
    const amountInAfterFee = this.getAmountInAfterFee(amountIn);
    return this.quoteAmountOut(amountInAfterFee, reservesIn.plus(amountInAfterFee), reservesOut);
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
   * @see UniswapV2Library.sol#quote
   */
  protected quoteAmountOut(
    amountIn: BigNumber,
    reservesIn: BigNumber,
    reservesOut: BigNumber
  ): BigNumber {
    return amountIn.multipliedBy(reservesOut).dividedToIntegerBy(reservesIn);
  }

  protected getReservesInOut(tokenIn: string): ReservesInOut {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    const inIsToken0 = this.isToken0(tokenIn);
    return {
      reservesIn: inIsToken0 ? this.pairData.reserves0 : this.pairData.reserves1,
      reservesOut: inIsToken0 ? this.pairData.reserves1 : this.pairData.reserves0,
    };
  }

  protected isToken0(tokenAddress: string): boolean {
    if (!this.pairData) {
      throw new Error('Pair data is not loaded');
    }

    return this.pairData.token0.toLowerCase() === tokenAddress.toLowerCase();
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
   * @see UniswapV2Router02.sol#_addLiquidity
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

    const optimalAmountB = this.quoteAmountOut(amountA, reserveA, reserveB);
    if (optimalAmountB.lte(amountB)) {
      return {
        amountA: amountA,
        amountB: optimalAmountB,
      };
    }

    const optimalAmountA = this.quoteAmountOut(amountB, reserveB, reserveA);
    return {
      amountA: optimalAmountA,
      amountB: amountB,
    };
  }

  protected buildZapSwapTx(
    amountIn: BigNumber,
    amountOutMin: BigNumber,
    path: string[],
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
            inputs: [
              {
                internalType: 'uint256',
                name: 'amountIn',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountOutMin',
                type: 'uint256',
              },
              {
                internalType: 'address[]',
                name: 'path',
                type: 'address[]',
              },
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256',
              },
            ],
            name: 'swapExactTokensForTokens',
            outputs: [
              {
                internalType: 'uint256[]',
                name: 'amounts',
                type: 'uint256[]',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(amountIn),
          bigNumberToBigInt(amountOutMin),
          path as Address[],
          to as Address,
          BigInt(deadline),
        ],
      }),
      tokens: [
        {
          token: path[0],
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
          [input.token.address, output.token.address],
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
            inputs: [
              {
                internalType: 'address',
                name: 'tokenA',
                type: 'address',
              },
              {
                internalType: 'address',
                name: 'tokenB',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'amountADesired',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountBDesired',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountAMin',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountBMin',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'to',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'deadline',
                type: 'uint256',
              },
            ],
            name: 'addLiquidity',
            outputs: [
              {
                internalType: 'uint256',
                name: 'amountA',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'amountB',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'liquidity',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ] as const satisfies Abi,
        args: [
          tokenA as Address,
          tokenB as Address,
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
          index: insertBalance ? getInsertIndex(2) : -1, // amountADesired
        },
        {
          token: tokenB,
          index: insertBalance ? getInsertIndex(3) : -1, // amountBDesired
        },
      ],
    };
  }

  protected buildZapRemoveLiquidityTx(
    tokenA: string,
    tokenB: string,
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
              { type: 'uint256', name: 'liquidity' },
              { type: 'uint256', name: 'amountAMin' },
              { type: 'uint256', name: 'amountBMin' },
              { type: 'address', name: 'to' },
              { type: 'uint256', name: 'deadline' },
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
          index: insertBalance ? getInsertIndex(2) : -1, // liquidity
        },
      ],
    };
  }

  async getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
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

  async getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
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
