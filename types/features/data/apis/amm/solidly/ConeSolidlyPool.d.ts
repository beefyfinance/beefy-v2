import type { PairData as BasePairData } from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
import type { SwapFeeParams } from '../types';
import BigNumber from 'bignumber.js';
type PairData = BasePairData & {
    swapFee: BigNumber;
};
export declare class ConeSolidlyPool extends SolidlyPool {
    protected pairData: PairData | undefined;
    protected updatePairData(): Promise<void>;
    protected getSwapFeeParams(): SwapFeeParams;
}
export {};
