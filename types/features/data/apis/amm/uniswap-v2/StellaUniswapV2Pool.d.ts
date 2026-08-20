import type { MintFeeParams, PairData as BasePairData } from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
import BigNumber from 'bignumber.js';
type PairData = BasePairData & {
    devFee: BigNumber;
};
export declare class StellaUniswapV2Pool extends UniswapV2Pool {
    protected pairData: PairData | undefined;
    protected updatePairData(): Promise<void>;
    protected getMintFeeParams(): MintFeeParams;
}
export {};
