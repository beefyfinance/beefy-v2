import type BigNumber from 'bignumber.js';
import type { ZapStep } from './types';
export declare function buildTokenApproveTx(token: string, spender: string, amountWei: BigNumber, insertBalance?: boolean): ZapStep;
