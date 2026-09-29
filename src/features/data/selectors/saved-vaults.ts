import {
  isCowcentratedGovVault,
  isCowcentratedStandardVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';

export const selectIsVaultIdSaved = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return !!state.ui.savedVaults.byVaultId[vaultId];
};

/** Saved CLM wrapper ids (from before CLMs became one row) mapped to their CLM's row id */
export const selectSavedVaultIdRemap = (
  state: BeefyState
): Record<VaultEntity['id'], VaultEntity['id']> => {
  const remap: Record<VaultEntity['id'], VaultEntity['id']> = {};
  for (const vaultId of Object.keys(state.ui.savedVaults.byVaultId)) {
    const vault = state.entities.vaults.byId[vaultId];
    if (vault && (isCowcentratedGovVault(vault) || isCowcentratedStandardVault(vault))) {
      remap[vaultId] = vault.cowcentratedIds.clm;
    }
  }
  return remap;
};
