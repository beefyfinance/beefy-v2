import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
import { ChainEntity } from '../entities/chain';

export const selectChainById = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.chains.byId,
  // get the user passed ID
  (_: BeefyState, chainId: ChainEntity['id']) => chainId,
  // last function receives previous function outputs as parameters
  (chainsById, chainId) => {
    if (chainsById[chainId] === undefined) {
      throw new Error(`selectChainById: Unknown chain id ${chainId}`);
    }
    return chainsById[chainId];
  }
);

export const selectAllChains = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.chains.allIds,
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.chains.byId,
  // last function receives previous function outputs as parameters
  (allIds, byId) => allIds.map(id => byId[id])
);
