import { createSelector } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { BeefyState } from '../state';

export const tokenByIdSelector = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.tokens.tokens.byId,
  // get the user passed ID
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  (tokensById, tokenId) => tokensById[tokenId]
);

export const tokenImplemByIdSelector = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.tokens.implems.byChainId,
  (store: BeefyState) => store.entities.tokens.implems.byId,
  // get the user passed ID
  (_: BeefyState, tokenId: TokenEntity['id'], chainId: ChainEntity['id']) => [tokenId, chainId],
  (implemsByChainId, implemsById, [tokenId, chainId]) => {
    const implemId = implemsByChainId[chainId].byTokenId[tokenId];
    return implemsById[implemId];
  }
);
