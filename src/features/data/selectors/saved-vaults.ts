import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';

export const selectIsVaultIdSaved = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return !!state.ui.savedVaults.byVaultId[vaultId];
};
