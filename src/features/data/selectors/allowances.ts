import { createSelector } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { BeefyState } from '../state';

export const allowanceByTokenId = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.allowance.byChainId,
  // get the user parameters
  (_: BeefyState, chainId: ChainEntity['id']) => chainId,
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  (allowanceByChainId, chainId, tokenId) => allowanceByChainId[chainId].byTokenId[tokenId]
);
