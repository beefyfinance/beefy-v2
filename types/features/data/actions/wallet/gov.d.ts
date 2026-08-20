import type { VaultGov } from '../../entities/vault';
import BigNumber from 'bignumber.js';
export declare const stakeGovVault: (vault: VaultGov, amount: BigNumber) => import("../../store/types").BeefyThunk;
export declare const unstakeGovVault: (vault: VaultGov, amount: BigNumber) => import("../../store/types").BeefyThunk;
export declare const claimGovVault: (vault: VaultGov) => import("../../store/types").BeefyThunk;
export declare const exitGovVault: (vault: VaultGov) => import("../../store/types").BeefyThunk;
