import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export declare const selectIsVaultQidao: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectIsVaultNexus: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectIsBeFTM: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
export declare const selectIsPoolTogether: (state: BeefyState, vaultId: VaultEntity["id"]) => boolean;
