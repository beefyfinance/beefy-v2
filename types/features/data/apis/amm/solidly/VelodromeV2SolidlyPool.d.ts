import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
import type { PairData, PairDataResponse } from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
import type { ZapStep } from '../../transact/zap/types';
export type FactoryDataResponse = {
    fee: string;
};
export type FactoryData = {
    fee: BigNumber;
};
export type VelodromeV2PairData = PairData & {
    factory: string;
};
export type VelodromeV2PairDataResponse = PairDataResponse & {
    factory: string;
};
export declare class VelodromeV2SolidlyPool extends SolidlyPool {
    protected pairData: VelodromeV2PairData | undefined;
    protected factoryData: FactoryData | undefined;
    protected updatePairData(): Promise<void>;
    updateFactoryData(): Promise<void>;
    updateAllData(): Promise<void>;
    protected getSwapFeeParams(): SwapFeeParams;
    protected buildZapSwapTx(amountIn: BigNumber, amountOutMin: BigNumber, routes: {
        from: string;
        to: string;
    }[], to: string, deadline: number, insertBalance: boolean): ZapStep;
}
