import type { VaultEntity } from '../entities/vault';
export type SavedVaultsState = {
    byVaultId: Record<VaultEntity['id'], boolean>;
};
