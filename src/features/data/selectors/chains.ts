import { createSelector } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { BeefyState } from '../state';

export const selectChainById = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.chains.byId,
  // get the user passed ID
  (_: BeefyState, chainId: ChainEntity['id']) => chainId,
  // last function receives previous function outputs as parameters
  (chainsById, chainId) => chainsById[chainId]
);
