import type { TokenErc20 } from '../../entities/token';
import BigNumber from 'bignumber.js';
export declare const MIN_APPROVAL_AMOUNT: BigNumber;
export declare const approve: (token: TokenErc20, spenderAddress: string, amount: BigNumber) => import("../../store/types").BeefyThunk;
