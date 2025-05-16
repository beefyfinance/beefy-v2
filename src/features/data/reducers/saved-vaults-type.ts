import type { VaultEntity } from '../entities/vault.ts';

export type SavedVaultsState = {
  byVaultId: Record<VaultEntity['id'], boolean>;
};
