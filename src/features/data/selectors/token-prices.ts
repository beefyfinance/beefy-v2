import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { TokenEntity } from '../entities/token';

export const selectTokenPriceByTokenId = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.prices.byTokenId,
  // get the user passed ID
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  (pricesByTokenId, tokenId) => {
    if (pricesByTokenId[tokenId] === undefined) {
      throw new Error(`selectTokenPriceByTokenId: Could not find price for token id ${tokenId}`);
    }
    return pricesByTokenId[tokenId];
  }
);
