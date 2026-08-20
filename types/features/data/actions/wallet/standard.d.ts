import type { VaultEntity, VaultStandard } from '../../entities/vault';
import type BigNumber from 'bignumber.js';
export declare const deposit: (vault: VaultEntity, amount: BigNumber, max: boolean) => import("../../store/types").BeefyThunk;
export declare const withdraw: (vault: VaultStandard, oracleAmount: BigNumber, max: boolean) => import("../../store/types").BeefyThunk;
