import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
import { SolidlyPool } from './SolidlyPool';
export type FactoryDataResponse = {
    fee: string;
};
export type FactoryData = {
    fee: BigNumber;
};
export declare class TokanSolidlyPool extends SolidlyPool {
    protected factoryData: FactoryData | undefined;
    protected updateFactoryData(): Promise<void>;
    updateAllData(): Promise<void>;
    protected getSwapFeeParams(): SwapFeeParams;
}
