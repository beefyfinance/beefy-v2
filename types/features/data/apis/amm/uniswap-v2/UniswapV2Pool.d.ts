import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
import type { AddLiquidityRatio, AddLiquidityResult, IUniswapLikePool, RemoveLiquidityResult, SwapFeeParams, SwapResult } from '../types';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types';
import type { TokenEntity } from '../../../entities/token';
import type { AmmEntityUniswapV2 } from '../../../entities/zap';
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
export declare class UniswapV2Pool implements IUniswapLikePool {
    protected address: string;
    protected amm: AmmEntityUniswapV2;
    protected chain: ChainEntity;
    readonly type = "uniswap-v2";
    protected pairData: PairData | undefined;
    protected factoryData: FactoryData | undefined;
    constructor(address: string, amm: AmmEntityUniswapV2, chain: ChainEntity);
    protected updatePairData(): Promise<void>;
    protected updateFactoryData(): Promise<void>;
    updateAllData(): Promise<void>;
    removeLiquidity(amount: BigNumber, updateReserves?: boolean): RemoveLiquidityResult;
    addLiquidity(amountA: BigNumber, tokenA: string, amountB: BigNumber): AddLiquidityResult;
    protected getMintFeeParams(): MintFeeParams;
    protected getMintFee(): MintFeeResult;
    protected calculateMintFee(reserves0: BigNumber, reserves1: BigNumber, totalSupply: BigNumber, kLast: BigNumber, feeNumerator: BigNumber, feeDenominator: BigNumber): BigNumber;
    swap(amountIn: BigNumber, tokenIn: string, updateReserves?: boolean): SwapResult;
    getAddLiquidityRatio(amountIn: BigNumber): AddLiquidityRatio;
    /**
     * Optimal swap amount when swapping tokenIn to tokenOut via the pool such that after the swap
     *  the amount of tokenIn/Out is in the correct ratio for adding liquidity.
     * Only works when swapping through the pool, otherwise use getAddLiquidityRatio
     */
    getOptimalSwapAmount(fullAmountIn: BigNumber, tokenIn: string): BigNumber;
    /**
     * @see UniswapV2Library.sol#getAmountOut
     */
    protected getAmountOut(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber): BigNumber;
    protected getSwapFeeParams(): SwapFeeParams;
    protected getAmountInAfterFee(amountIn: BigNumber): BigNumber;
    /**
     * @see UniswapV2Library.sol#quote
     */
    protected quoteAmountOut(amountIn: BigNumber, reservesIn: BigNumber, reservesOut: BigNumber): BigNumber;
    protected getReservesInOut(tokenIn: string): ReservesInOut;
    protected isToken0(tokenAddress: string): boolean;
    protected isTokenInPair(token: TokenEntity): boolean;
    /**
     * @see UniswapV2Router02.sol#_addLiquidity
     */
    protected getOptimalAddLiquidityAmounts(amountA: BigNumber, amountB: BigNumber, reserveA: BigNumber, reserveB: BigNumber): LiquidityAmounts;
    protected buildZapSwapTx(amountIn: BigNumber, amountOutMin: BigNumber, path: string[], to: string, deadline: number, insertBalance: boolean): ZapStep;
    getZapSwap(request: ZapStepRequest): Promise<ZapStepResponse>;
    protected buildZapAddLiquidityTx(tokenA: string, tokenB: string, amountADesired: BigNumber, amountBDesired: BigNumber, amountAMin: BigNumber, amountBMin: BigNumber, to: string, deadline: number, insertBalance: boolean): ZapStep;
    protected buildZapRemoveLiquidityTx(tokenA: string, tokenB: string, liquidity: BigNumber, amountAMin: BigNumber, amountBMin: BigNumber, to: string, deadline: number, insertBalance: boolean): ZapStep;
    getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
    getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse>;
}
