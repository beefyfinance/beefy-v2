import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { AmmEntity } from '../entities/amm';
import type { ChainEntity } from '../entities/chain';

export const selectAmmsByChainId = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => chainId,
  (state: BeefyState, _chainId: ChainEntity['id']) => state.entities.amms.byChainId,
  (chainId, byChainId) => byChainId[chainId] || []
);

export const selectAmmById = createSelector(
  (state: BeefyState, ammId: AmmEntity['id']) => ammId,
  (state: BeefyState, _ammId: AmmEntity['id']) => state.entities.amms.byId,
  (ammId, byId) => byId[ammId] || null
);
