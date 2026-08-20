import type { MintFeeParams, FactoryData as BaseFactoryData, FactoryDataResponse as BaseFactoryDataResponse } from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
export type FactoryDataResponse = BaseFactoryDataResponse & {
    mintFee: string;
    swapFee: string;
};
export type FactoryData = BaseFactoryData & {
    mintFee: BigNumber;
    swapFee: BigNumber;
};
export declare class TombSwapUniswapV2Pool extends UniswapV2Pool {
    protected factoryData: FactoryData | undefined;
    protected updateFactoryData(): Promise<void>;
    protected getMintFeeParams(): MintFeeParams;
    protected getSwapFeeParams(): SwapFeeParams;
}
