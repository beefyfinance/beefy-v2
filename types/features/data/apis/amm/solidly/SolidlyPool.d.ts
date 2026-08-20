import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
import type { AddLiquidityRatio, AddLiquidityResult, IUniswapLikePool, RemoveLiquidityResult, SwapFeeParams, SwapResult } from '../types';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types';
import { type TokenEntity } from '../../../entities/token';
import type { AmmEntitySolidly } from '../../../entities/zap';
export declare enum MetadataKeys {
    decimals0 = 0,
    decimals1 = 1,
    reserves0 = 2,
    reserves1 = 3,
    stable = 4,
    token0 = 5,
    token1 = 6
}
export type MetadataRaw = {
    0: string;
    1: string;
    2: string;
    3: string;
    4: boolean;
    5: string;
    6: string;
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
export declare class SolidlyPool implements IUniswapLikePool {
    protected address: string;
    protected amm: AmmEntitySolidly;
    protected chain: ChainEntity;
    readonly type = "solidly";
    protected pairData: PairData | undefined;
    constructor(address: string, amm: AmmEntitySolidly, chain: ChainEntity);
    protected updatePairData(): Promise<void>;
    updateAllData(): Promise<void>;
    removeLiquidity(amount: BigNumber, updateReserves?: boolean): RemoveLiquidityResult;
    addLiquidity(amountA: BigNumber, tokenA: string, amountB: BigNumber): AddLiquidityResult;
    swap(amountIn: BigNumber, tokenIn: string, updateReserves?: boolean): SwapResult;
    protected calculatePriceImpact(amountIn: BigNumber, amountOut: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber, decimalsIn: number, decimalsOut: number): number;
    getAddLiquidityRatio(amountIn: BigNumber): AddLiquidityRatio;
    protected getAddLiquidityRatioStable(amountIn: BigNumber): AddLiquidityRatio;
    protected getAddLiquidityRatioVolatile(amountIn: BigNumber): AddLiquidityRatio;
    /**
     * Optimal swap amount when swapping tokenIn to tokenOut via the pool such that after the swap
     *  the amount of tokenIn/Out is in the correct ratio for adding liquidity.
     * Only works when swapping through the pool, otherwise use getAddLiquidityRatio
     */
    getOptimalSwapAmount(fullAmountIn: BigNumber, tokenIn: string): BigNumber;
    /**
     * @see BeefySolidlyZap.sol#_getStableSwap
     */
    getOptimalSwapAmountStable(fullAmountIn: BigNumber, tokenIn: string): BigNumber;
    getOptimalSwapAmountVolatile(fullAmountIn: BigNumber, tokenIn: string): BigNumber;
    /**
     * @see BaseV1Pair.sol#getAmountOut
     */
    protected getAmountOut(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber, decimalsIn: number, decimalsOut: number, stable: boolean): BigNumber;
    protected getSwapFeeParams(): SwapFeeParams;
    protected getAmountInAfterFee(amountIn: BigNumber): BigNumber;
    /**
     * @see BaseV1Pair.sol#_getAmountOut
     */
    protected quoteAmountOut(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber, decimalsIn: number, decimalsOut: number, stable: boolean): BigNumber;
    protected quoteAmountOutVolatile(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber): BigNumber;
    protected quoteAmountOutStable(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber, decimalsIn: number, decimalsOut: number): BigNumber;
    protected quoteAmountOutNormalized(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber, stable: boolean): BigNumber;
    protected quoteAmountOutStableNormalized(amountInNormalized: BigNumber, reservesInNormalized: BigNumber, reservesOutNormalized: BigNumber): BigNumber;
    /**
     * Shifts the amount from the given decimals to 18 decimals.
     */
    protected normalize(amount: BigNumber, decimals: number): BigNumber;
    /**
     * @see BaseV1Pair.sol#_k
     */
    protected getK(reserves0: BigNumber, reserves1: BigNumber, decimals0: number, decimals1: number, stable: boolean): BigNumber;
    protected getStableK(reserves0: BigNumber, reserves1: BigNumber, decimals0: number, decimals1: number): BigNumber;
    protected getStableKNormalized(x: BigNumber, y: BigNumber): BigNumber;
    protected getVolatileK(reserves0: BigNumber, reserves1: BigNumber): BigNumber;
    /**
     * This uses newton's method to approximate the y value that satisfies the equation x^3*y + y^3*x >= k
     * @see BaseV1Pair.sol#_get_y
     */
    protected getY(x0: BigNumber, xy: BigNumber, y: BigNumber): BigNumber;
    /**
     * @see BaseV1Pair.sol#_f
     */
    protected getF(x0: BigNumber, y: BigNumber): BigNumber;
    /**
     * @see BaseV1Pair.sol#_d
     */
    protected getD(x0: BigNumber, y: BigNumber): BigNumber;
    protected getInOut(tokenIn: string): InOut;
    protected isToken0(token: string): boolean;
    protected isTokenInPair(token: TokenEntity): boolean;
    /**
     * @see BaseV1Router01.sol#_addLiquidity
     */
    protected getOptimalAddLiquidityAmounts(amountA: BigNumber, amountB: BigNumber, reserveA: BigNumber, reserveB: BigNumber): LiquidityAmounts;
    protected quoteLiquidity(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber): BigNumber;
    protected buildZapSwapTx(amountIn: BigNumber, amountOutMin: BigNumber, routes: {
        from: string;
        to: string;
    }[], to: string, deadline: number, insertBalance: boolean): ZapStep;
    getZapSwap(request: ZapStepRequest): Promise<ZapStepResponse>;
    protected buildZapAddLiquidityTx(tokenA: string, tokenB: string, stable: boolean, amountADesired: BigNumber, amountBDesired: BigNumber, amountAMin: BigNumber, amountBMin: BigNumber, to: string, deadline: number, insertBalance: boolean): ZapStep;
    getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
    protected buildZapRemoveLiquidityTx(tokenA: string, tokenB: string, stable: boolean, liquidity: BigNumber, amountAMin: BigNumber, amountBMin: BigNumber, to: string, deadline: number, insertBalance: boolean): ZapStep;
    getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
}
