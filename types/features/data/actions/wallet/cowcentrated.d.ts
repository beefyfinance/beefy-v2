import type { VaultCowcentrated } from '../../entities/vault';
import type BigNumber from 'bignumber.js';
export declare const v3Deposit: (vault: VaultCowcentrated, amountToken0: BigNumber, amountToken1: BigNumber) => import("../../store/types").BeefyThunk;
export declare const v3Withdraw: (vault: VaultCowcentrated, withdrawAmount: BigNumber, max: boolean) => import("../../store/types").BeefyThunk;
