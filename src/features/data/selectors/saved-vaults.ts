import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';

export const selectIsVaultIdSaved = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return !!state.ui.savedVaults.byVaultId[vaultId];
};
