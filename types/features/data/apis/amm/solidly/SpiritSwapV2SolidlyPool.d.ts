import type { PairData as BasePairData } from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
import type { SwapFeeParams } from '../types';
import BigNumber from 'bignumber.js';
type PairData = BasePairData & {
    fee: BigNumber;
};
export declare class SpiritSwapV2SolidlyPool extends SolidlyPool {
    protected pairData: PairData | undefined;
    protected updatePairData(): Promise<void>;
    protected getSwapFeeParams(): SwapFeeParams;
}
export {};
