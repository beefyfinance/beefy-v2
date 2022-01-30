import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
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
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.entities.boosts.byVaultId[vaultId]],
  vaultIdBoost => vaultIdBoost !== undefined && vaultIdBoost.activeBoostsIds.length > 0
);

export const selectActiveVaultBoostId = createSelector(
  [(state: BeefyState, vaultId: VaultEntity['id']) => state.entities.boosts.byVaultId[vaultId]],
  vaultIdBoost => {
    const boosts = vaultIdBoost.activeBoostsIds;
    if (boosts.length > 1) {
      throw new Error('Vault has more than one active boost');
    }
    if (boosts.length <= 0) {
      throw new Error('Vault has no active boost');
    }
    return boosts[0];
  }
);
