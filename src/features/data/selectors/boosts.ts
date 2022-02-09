import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';

export const selectBoostById = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.boosts.byId,
  // get the user passed ID
  (_: BeefyState, boostId: VaultEntity['id']) => boostId,
  // last function receives previous function outputs as parameters
  (boostsByIds, boostId) => {
    if (boostsByIds[boostId] === undefined) {
      throw new Error(`selectBoostById: Unknown vault id ${boostId}`);
    }
    return boostsByIds[boostId];
  }
);

export const selectBoostsByChainId = (state: BeefyState, chainId: ChainEntity['id']) => {
  return state.entities.boosts.byChainId[chainId]?.allBoostsIds || [];
};

export const selectIsVaultBoosted = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds.length > 0 || false;
};

// TODO
export const selectIsVaultMoonpot = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return false;
};

export const selectActiveVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.activeBoostsIds || [];
};

export const selectAllVaultBoostIds = (state: BeefyState, vaultId: VaultEntity['id']) => {
  return state.entities.boosts.byVaultId[vaultId]?.allBoostsIds || [];
};
