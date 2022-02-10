import { BeefyState } from '../../../redux-types';
import { VaultEntity } from '../entities/vault';

export const selectIsVaultMoonpot = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.biz.partners.moonpot.byVaultId[vaultId] !== undefined;
};
