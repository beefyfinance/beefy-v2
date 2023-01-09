import Web3 from 'web3';
import { AmmEntityUniswapV2 } from '../../entities/amm';
import BigNumber from 'bignumber.js';
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { UniswapV2FactoryAbi, UniswapV2PairAbi } from '../../../../config/abi';
import { ChainEntity } from '../../entities/chain';
import { createContract } from '../../../../helpers/web3';
import { ZERO_ADDRESS } from '../../../../helpers/addresses';
import { getWeb3Instance } from '../instances';
import { BIG_ZERO } from '../../../../helpers/big-number';
import {
  AddLiquidityRatio,
  AddLiquidityResult,
  IPool,
  RemoveLiquidityResult,
  SwapFeeParams,
  SwapResult,
  WANT_TYPE,
} from './types';

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

export class UniswapV2Pool implements IPool {
  public readonly type = 'uniswapv2';

  protected pairData: PairData | null = null;
  protected factoryData: FactoryData | null = null;
  protected web3: Web3 | null = null;
  protected multicall: MultiCall | null = null;

  constructor(
    protected address: string,
    protected amm: AmmEntityUniswapV2,
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
    const contract = createContract(UniswapV2PairAbi, this.address);
    return [
      {
        totalSupply: contract.methods.totalSupply(),
        decimals: contract.methods.decimals(),
        token0: contract.methods.token0(),
        token1: contract.methods.token1(),
        reserves: contract.methods.getReserves(),
        kLast: contract.methods.kLast(),
      },
    ];
  }

  protected consumePairDataResponse(untypedResult: any[]) {
    const result = (untypedResult as PairDataResponse[])[0];

    this.pairData = {
      totalSupply: new BigNumber(result.totalSupply),
      decimals: parseInt(result.totalSupply, 10),
      token0: result.token0,
      token1: result.token1,
      reserves0: new BigNumber(result.reserves[0]),
      reserves1: new BigNumber(result.reserves[1]),
      kLast: new BigNumber(result.kLast),
    };
  }

  async updatePairData() {
    const multicall = await this.getMulticall();
    const [results] = await multicall.all([this.getPairDataRequest()]);
    this.consumePairDataResponse(results);
  }

  protected getFactoryDataRequest(): ShapeWithLabel[] {
    const contract = createContract(UniswapV2FactoryAbi, this.amm.factoryAddress);
    return [
      {
        feeTo: contract.methods.feeTo(),
      },
    ];
  }

  protected consumeFactoryDataResponse(untypedResult: any[]) {
    const result = (untypedResult as FactoryDataResponse[])[0];

    this.factoryData = {
      feeTo: result.feeTo || ZERO_ADDRESS,
    };
  }

  async updateFactoryData() {
    const multicall = await this.getMulticall();
    const [results] = await multicall.all([this.getFactoryDataRequest()]);
    this.consumeFactoryDataResponse(results);
  }

  async updateAllData(otherCalls: ShapeWithLabel[][] = []): Promise<any[][]> {
    const multicall = await this.getMulticall();
    const calls = [this.getPairDataRequest(), this.getFactoryDataRequest(), ...otherCalls];
    const [pairResults, factoryResults, ...otherResults] = await multicall.all(calls);

    this.consumePairDataResponse(pairResults);
    this.consumeFactoryDataResponse(factoryResults);

    return otherResults;
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
   * @see BeefyZap.sol#_getSwapAmount
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
    const inIsToken0 = this.isToken0(tokenIn);
    return {
      reservesIn: inIsToken0 ? this.pairData.reserves0 : this.pairData.reserves1,
      reservesOut: inIsToken0 ? this.pairData.reserves1 : this.pairData.reserves0,
    };
  }

  protected isToken0(token: string): boolean {
    return this.pairData.token0.toLowerCase() === token.toLowerCase();
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

  getWantType(): WANT_TYPE {
    return WANT_TYPE.UNISWAP_V2;
  }
}
