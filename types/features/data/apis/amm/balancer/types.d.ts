import type BigNumber from 'bignumber.js';
import type { ZapStep } from '../../transact/zap/types';
import type { QueryExitPoolResponse, QueryJoinPoolResponse } from './vault/types';
export declare enum BalancerFeature {
    /** Add/Remove liquidity using only 1 token of the pool */
    AddRemoveSingle = 0,
    /** Add/Remove liquidity using all tokens of the pool in balanced ratio */
    AddRemoveAll = 1,
    /** Add liquidity supports slippage allowance */
    AddSlippage = 2,
    /** Remove liquidity supports slippage allowance */
    RemoveSlippage = 3
}
export interface IBalancerPool {
    readonly type: 'balancer';
    supportsFeature(feature: BalancerFeature): boolean;
}
/** Join/Exit with all tokens in ratio */
export interface IBalancerAllPool extends IBalancerPool {
    getSwapRatios(): Promise<BigNumber[]>;
    quoteAddLiquidity(amountsIn: BigNumber[]): Promise<QueryJoinPoolResponse>;
    getAddLiquidityZap(maxAmountsIn: BigNumber[], liquidity: BigNumber, from: string, insertBalance: boolean): Promise<ZapStep>;
    quoteRemoveLiquidity(amountIn: BigNumber): Promise<QueryExitPoolResponse>;
    getRemoveLiquidityZap(amountIn: BigNumber, minAmountsOut: BigNumber[], from: string, insertBalance: boolean): Promise<ZapStep>;
}
/** Join/Exit with one token */
export interface IBalancerSinglePool extends IBalancerPool {
    quoteAddLiquidityOneToken(amountIn: BigNumber, tokenIn: string): Promise<QueryJoinPoolResponse>;
    quoteRemoveLiquidityOneToken(liquidityIn: BigNumber, tokenOut: string): Promise<QueryExitPoolResponse>;
    getAddLiquidityOneTokenZap(amountIn: BigNumber, tokenIn: string, liquidityOutMin: BigNumber, from: string, insertBalance: boolean): Promise<ZapStep>;
    getRemoveLiquidityOneTokenZap(liquidityIn: BigNumber, tokenOut: string, amountOutMin: BigNumber, from: string, insertBalance: boolean): Promise<ZapStep>;
}
