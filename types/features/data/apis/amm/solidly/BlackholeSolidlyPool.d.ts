import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
import type { PairData } from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
import type { ZapStep } from '../../transact/zap/types';
export type FactoryData = {
    fee: BigNumber;
};
export type BlackholePairData = PairData & {
    factory: string;
};
export declare class BlackholeSolidlyPool extends SolidlyPool {
    protected pairData: BlackholePairData | undefined;
    protected factoryData: FactoryData | undefined;
    updateFactoryData(): Promise<void>;
    updateAllData(): Promise<void>;
    protected getSwapFeeParams(): SwapFeeParams;
    protected buildZapSwapTx(amountIn: BigNumber, amountOutMin: BigNumber, routes: {
        from: string;
        to: string;
    }[], to: string, deadline: number, insertBalance: boolean): ZapStep;
}
