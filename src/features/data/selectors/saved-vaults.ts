import type { BeefyState } from '../../../redux-types.ts';
import type { VaultEntity } from '../entities/vault.ts';

export const selectIsVaultIdSaved = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return !!state.ui.savedVaults.byVaultId[vaultId];
};
