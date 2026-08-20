import type { FactoryData as BaseFactoryData, FactoryDataResponse as BaseFactoryDataResponse, MintFeeResult } from './UniswapV2Pool';
import { UniswapV2Pool } from './UniswapV2Pool';
export type FactoryDataResponse = BaseFactoryDataResponse & {
    feeToStake: string;
};
export type FactoryData = BaseFactoryData & {
    feeToStake: string;
};
export declare class SwapsicleUniswapV2Pool extends UniswapV2Pool {
    protected factoryData: FactoryData | undefined;
    protected updateFactoryData(): Promise<void>;
    protected getMintFee(): MintFeeResult;
}
