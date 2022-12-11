import BigNumber from 'bignumber.js';
import { ShapeWithLabel } from 'eth-multicall';

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

// Must match BeefyZapOneInch::WantType
export enum WANT_TYPE {
  SINGLE,
  UNISWAP_V2,
  SOLIDLY_STABLE,
  SOLIDLY_VOLATILE,
}

export type SwapFeeParams = {
  numerator: BigNumber;
  denominator: BigNumber;
};

export interface IPool {
  swap(amountIn: BigNumber, tokenIn: string, updateReserves?: boolean): SwapResult;
  addLiquidity(amountA: BigNumber, tokenA: string, amountB: BigNumber): AddLiquidityResult;
  removeLiquidity(amount: BigNumber, updateReserves?: boolean): RemoveLiquidityResult;
  getAddLiquidityRatio(amountIn: BigNumber): AddLiquidityRatio;
  updateAllData(otherCalls?: ShapeWithLabel[][]): Promise<any[][]>;
  getWantType(): WANT_TYPE;
}
