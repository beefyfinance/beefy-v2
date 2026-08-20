import type { MintFeeParams, PairData as BasePairData } from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
type PairData = BasePairData & {
    devFee: BigNumber;
    swapFee: BigNumber;
};
export declare class BiSwapUniswapV2Pool extends UniswapV2Pool {
    protected pairData: PairData | undefined;
    protected updatePairData(): Promise<void>;
    protected getMintFeeParams(): MintFeeParams;
    protected getSwapFeeParams(): SwapFeeParams;
}
export {};
