import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';

export const selectBoostById = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.boosts.byId,
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
  (store: BeefyState, chainId: ChainEntity['id']) => {
    if (store.entities.boosts.byChainId[chainId] === undefined) {
      throw new Error(`selectBoostsByChainId: Could not find boost data for chain ${chainId}`);
    }

    return store.entities.boosts.byChainId[chainId];
  },
  // last function receives previous function outputs as parameters
  vaultsChainId => vaultsChainId.allBoostsIds
);
