import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';

export const selectVaultById = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.vaults.byId,
  // get the user passed ID
  (_: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  // last function receives previous function outputs as parameters
  (vaultsByIds, vaultId) => {
    if (vaultsByIds[vaultId] === undefined) {
      throw new Error(`selectVaultById: Unknown vault id ${vaultId}`);
    }
    return vaultsByIds[vaultId];
  }
);

export const selectVaultByChainId = createSelector(
  // get a tiny bit of the data
  (store: BeefyState, chainId: ChainEntity['id']) => store.entities.vaults.byChainId[chainId],
  // last function receives previous function outputs as parameters
  vaultsChainId => vaultsChainId.allActiveIds.concat(vaultsChainId.allRetiredIds)
);

export const selectVaultPricePerFullShare = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.vaults.pricePerFullShare.byVaultId,
  // get the user passed ID
  (_: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  // last function receives previous function outputs as parameters
  (byVaultId, vaultId) => {
    if (byVaultId[vaultId] === undefined) {
      throw new Error(
        `selectVaultPricePerFullShare: Could not find contract data for vault id ${vaultId}`
      );
    }
    return byVaultId[vaultId];
  }
);
