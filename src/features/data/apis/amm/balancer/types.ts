import type BigNumber from 'bignumber.js';
import type { ZapStep } from '../../transact/zap/types';
import type { QueryExitPoolResponse, QueryJoinPoolResponse } from './vault/types';

export interface IBalancerPool {
  readonly type: 'balancer';
}

export interface IBalancerJoinPool extends IBalancerPool {
  readonly subType: 'join';
  readonly joinSupportsSlippage: boolean;

  getSwapRatios(): Promise<BigNumber[]>;
  quoteAddLiquidity(amountsIn: BigNumber[]): Promise<QueryJoinPoolResponse>;
  getAddLiquidityZap(
    maxAmountsIn: BigNumber[],
    liquidity: BigNumber,
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep>;
  quoteRemoveLiquidity(amountIn: BigNumber): Promise<QueryExitPoolResponse>;
  getRemoveLiquidityZap(
    amountIn: BigNumber,
    minAmountsOut: BigNumber[],
    from: string,
    insertBalance: boolean
  ): Promise<ZapStep>;
}

export interface IBalancerSwapPool extends IBalancerPool {
  readonly subType: 'swap';
}
