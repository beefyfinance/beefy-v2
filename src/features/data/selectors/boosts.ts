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

export const selectBoostsByChainId = createSelector(
  // get a tiny bit of the data
  (state: BeefyState, chainId: ChainEntity['id']) => {
    if (state.entities.boosts.byChainId[chainId] === undefined) {
      return [];
    }

    return state.entities.boosts.byChainId[chainId].allBoostsIds;
  },
  // last function receives previous function outputs as parameters
  allBoostsIds => allBoostsIds
);

export const selectIsVaultBoosted = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.boosts.byVaultId[vaultId],
  vaultIdBoost => vaultIdBoost !== undefined && vaultIdBoost.activeBoostsIds.length > 0
);

// TODO
export const selectIsVaultMoonpot = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.boosts.byVaultId[vaultId],
  vaultIdBoost => false
);

export const selectActiveVaultBoostIds = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.boosts.byVaultId[vaultId],
  vaultIdBoost => {
    if (!vaultIdBoost) {
      return [];
    }
    return vaultIdBoost.activeBoostsIds;
  }
);
