import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { AmmEntity } from '../entities/amm';
import type { ChainEntity } from '../entities/chain';

export const selectBeefyZapsByChainId = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => chainId,
  (state: BeefyState, _chainId: ChainEntity['id']) => state.entities.zaps.beefy.byChainId,
  (chainId, byChainId) => byChainId[chainId] || []
);

export const selectBeefyZapByAmmId = createSelector(
  (state: BeefyState, ammId: AmmEntity['id']) => ammId,
  (state: BeefyState, _ammId: AmmEntity['id']) => state.entities.zaps.beefy.byAmmId,
  (ammId, byAmmId) => byAmmId[ammId] || null
);

export const selectOneInchZapByChainId = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => chainId,
  (state: BeefyState, _chainId: ChainEntity['id']) => state.entities.zaps.oneInch.byChainId,
  (chainId, byChainId) => byChainId[chainId] || null
);
