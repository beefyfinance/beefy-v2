import { createSelector } from '@reduxjs/toolkit';
import { TokenEntity } from '../entities/token';
import { BeefyState } from '../state';

export const selectTokenPriceByTokenId = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.prices.byTokenId,
  // get the user passed ID
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  (pricesByTokenId, tokenId) => pricesByTokenId[tokenId]
);
