import type { MinterEntity } from '../entities/minter';
import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare const selectMinterById: (state: BeefyState, minterId: MinterEntity["id"]) => MinterEntity;
export declare const selectMintersByVaultId: (state: BeefyState, vaultId: VaultEntity["id"]) => MinterEntity["id"][];
export declare const selectMinterReserves: (state: BeefyState, minterId: MinterEntity["id"]) => BigNumber;
export declare const selectMinterTotalSupply: (state: BeefyState, minterId: MinterEntity["id"]) => BigNumber;
export declare const selectMinterVaultsType: (state: BeefyState, minterId: MinterEntity["id"]) => "WithEarnings" | "WithoutEarnings" | "OnlyEarnings";
