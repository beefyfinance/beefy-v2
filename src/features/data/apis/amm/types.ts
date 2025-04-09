import type BigNumber from 'bignumber.js';
import type { ZapStepRequest, ZapStepResponse } from '../transact/zap/types.ts';
import type { TokenAmount } from '../transact/transact-types.ts';

export type SwapResult = {
  amountIn: BigNumber;
  amountInAfterFee: BigNumber;
  amountOut: BigNumber;
  reservesIn: BigNumber;
  reservesInAfter: BigNumber;
  reservesOut: BigNumber;
  reservesOutAfter: BigNumber;
  priceImpact: number;
};

export type AddLiquidityResult = {
  liquidity: BigNumber;
  addAmountA: BigNumber;
  addAmountB: BigNumber;
  returnedA: BigNumber;
  returnedB: BigNumber;
};

export type RemoveLiquidityResult = {
  amount0: BigNumber;
  amount1: BigNumber;
  token0: string;
  token1: string;
};

export type AddLiquidityRatio = {
  amount0: BigNumber;
  amount1: BigNumber;
};

export type SwapFeeParams = {
  numerator: BigNumber;
  denominator: BigNumber;
};

export interface IUniswapLikePool extends IPool {
  getOptimalSwapAmount(fullAmountIn: BigNumber, tokenIn: string): BigNumber;

  swap(amountIn: BigNumber, tokenIn: string, updateReserves?: boolean): SwapResult;

  addLiquidity(amountA: BigNumber, tokenA: string, amountB: BigNumber): AddLiquidityResult;

  removeLiquidity(amount: BigNumber, updateReserves?: boolean): RemoveLiquidityResult;

  getAddLiquidityRatio(amountIn: BigNumber): AddLiquidityRatio;

  getZapSwap(request: ZapStepRequest): Promise<ZapStepResponse>;

  getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;

  getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
}

export type GammaHypervisorData = {
  currentTick: BigNumber;
  totalSupply: BigNumber;
  totalAmounts: [BigNumber, BigNumber];
  sqrtPrice: BigNumber;
  priceRatio: BigNumber;
};

export interface IGammaPool extends IPool {
  getHypervisorData(): GammaHypervisorData;

  getAddLiquidityRatio(testAmounts: TokenAmount[]): Promise<BigNumber>;

  getOptimalAddLiquidity(inputs: TokenAmount[]): Promise<TokenAmount[]>;

  quoteRemoveLiquidity(
    sharesWei: BigNumber,
    tokenHolders: [string, ...string[]]
  ): Promise<BigNumber[]>;

  getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;

  getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
}

export interface IPool {
  readonly type: string;

  updateAllData(): Promise<void>;
}
