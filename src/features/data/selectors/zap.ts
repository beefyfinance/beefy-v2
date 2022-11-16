import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { AmmEntity } from '../entities/amm';
import { ChainEntity } from '../entities/chain';

export const selectBeefyZapsByChainId = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => chainId,
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.zaps.beefy.byChainId,
  (chainId, byChainId) => byChainId[chainId] || []
);

export const selectBeefyZapByAmmId = createSelector(
  (state: BeefyState, ammId: AmmEntity['id']) => ammId,
  (state: BeefyState, ammId: AmmEntity['id']) => state.entities.zaps.beefy.byAmmId,
  (ammId, byAmmId) => byAmmId[ammId] || null
);

export const selectOneInchZapByChainId = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => chainId,
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.zaps.oneInch.byChainId,
  (chainId, byChainId) => byChainId[chainId] || null
);
