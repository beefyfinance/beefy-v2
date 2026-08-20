import type { MintFeeParams, FactoryData as BaseFactoryData, FactoryDataResponse as BaseFactoryDataResponse } from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
export type FactoryDataResponse = BaseFactoryDataResponse & {
    pairRate: string;
    pairFees: string;
};
export type FactoryData = BaseFactoryData & {
    pairRate: BigNumber;
    pairFees: BigNumber;
};
export declare class MdexUniswapV2Pool extends UniswapV2Pool {
    protected factoryData: FactoryData | undefined;
    protected updateFactoryData(): Promise<void>;
    protected getMintFeeParams(): MintFeeParams;
    protected getSwapFeeParams(): SwapFeeParams;
}
