import BigNumber from 'bignumber.js';
import type { SwapFeeParams } from '../types';
import type { PairData as BasePairData } from './SolidlyPool';
import { SolidlyPool } from './SolidlyPool';
type PairData = BasePairData & {
    feeRatio: BigNumber;
};
export declare class EthereumSolidlyPool extends SolidlyPool {
    protected pairData: PairData | undefined;
    protected updatePairData(): Promise<void>;
    protected getSwapFeeParams(): SwapFeeParams;
}
export {};
