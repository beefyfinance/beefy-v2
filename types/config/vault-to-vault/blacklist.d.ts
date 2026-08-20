import type { VaultEntity } from '../../features/data/entities/vault';
export declare const V2V_VAULT_BLACKLIST: ReadonlySet<VaultEntity['id']>;
export declare function isVaultBlacklistedForV2V(vaultId: VaultEntity['id']): boolean;
