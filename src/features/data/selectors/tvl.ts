import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { VaultEntity } from '../entities/vault';

export const selectVaultPricePerFullShare = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.tvl.byVaultId,
  // get the user passed ID
  (_: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  // last function receives previous function outputs as parameters
  (byVaultId, vaultId) => {
    if (byVaultId[vaultId] === undefined) {
      throw new Error(
        `selectVaultPricePerFullShare: Could not find contract data for vault id ${vaultId}`
      );
    }
    return byVaultId[vaultId].pricePerFullShare;
  }
);
