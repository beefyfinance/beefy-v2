import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { AmmEntity } from '../entities/amm';
import { ChainEntity } from '../entities/chain';

export const selectAmmsByChainId = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => chainId,
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.amms.byChainId,
  (chainId, byChainId) => byChainId[chainId] || []
);

export const selectAmmById = createSelector(
  (state: BeefyState, ammId: AmmEntity['id']) => ammId,
  (state: BeefyState, ammId: AmmEntity['id']) => state.entities.amms.byId,
  (ammId, byId) => byId[ammId] || null
);
