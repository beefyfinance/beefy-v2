import { createSelector } from '@reduxjs/toolkit';
import { VaultEntity } from '../entities/vault';
import { BeefyState } from '../state';

export const vaultByIdSelector = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.vaults.byId,
  // get the user passed ID
  (_: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  // last function receives previous function outputs as parameters
  (vaultsByIds, vaultId) => vaultsByIds[vaultId]
);
