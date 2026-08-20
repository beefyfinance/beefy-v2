import type { VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare const selectIsVaultIdSaved: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
