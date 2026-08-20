import type BigNumber from 'bignumber.js';
import type { ZapStep } from '../../transact/zap/types';
import { VelodromeV2SolidlyPool } from './VelodromeV2SolidlyPool';
/**
 * Same as VelodromeV2SolidlyPool but the swap route does not include the factory address
 */
export declare class VelodromeV2ModeSolidlyPool extends VelodromeV2SolidlyPool {
    protected buildZapSwapTx(amountIn: BigNumber, amountOutMin: BigNumber, routes: {
        from: string;
        to: string;
    }[], to: string, deadline: number, insertBalance: boolean): ZapStep;
}
