import type { FactoryData as BaseFactoryData, FactoryDataResponse as BaseFactoryDataResponse } from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
export type FactoryDataResponse = BaseFactoryDataResponse & {
    feeRate: string;
};
export type FactoryData = BaseFactoryData & {
    feeRate: BigNumber;
};
export declare class NetswapUniswapV2Pool extends UniswapV2Pool {
    protected factoryData: FactoryData | undefined;
    protected updateFactoryData(): Promise<void>;
    protected getSwapFeeParams(): SwapFeeParams;
}
