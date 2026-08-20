import { type VaultEntity } from '../../entities/vault';
import type BigNumber from 'bignumber.js';
export declare const deposit: (vault: VaultEntity, amount: BigNumber) => import("../../store/types").BeefyThunk;
export declare const requestRedeem: (vault: VaultEntity, oracleAmount: BigNumber, max: boolean) => import("../../store/types").BeefyThunk;
export declare const fulfillRedeem: (vaultId: VaultEntity["id"], requestId: bigint) => import("../../store/types").BeefyThunk;
