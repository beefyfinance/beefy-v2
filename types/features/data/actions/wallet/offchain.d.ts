import type { ChainEntity } from '../../entities/chain';
import type { VaultEntity } from '../../entities/vault';
export declare const claimMerkl: (chainId: ChainEntity["id"]) => import("../../store/types").BeefyThunk;
export declare const claimStellaSwap: (chainId: ChainEntity["id"], vaultId: VaultEntity["id"]) => import("../../store/types").BeefyThunk;
