import { createSelector } from '@reduxjs/toolkit';
import createCachedSelector from 're-reselect';
import { BeefyState } from '../../../redux-types';

export const selectChainById = createCachedSelector(
  (state, chainId) => chainId,
  state => state.entities.chains.byId,
  (chainId, byId) => byId[chainId]
)((state, chainId) => chainId);

export const selectAllChains = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.chains.allIds,
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.chains.byId,
  // last function receives previous function outputs as parameters
  (allIds, byId) => allIds.map(id => byId[id])
);

export const selectAllChainIds = (state: BeefyState) => state.entities.chains.allIds;
