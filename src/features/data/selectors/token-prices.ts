import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
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
      // if price is not in the api, it's rug and value is 0
      console.warn(`selectTokenPriceByTokenId: Could not find price for token id ${tokenId}`);
      return new BigNumber(0);
    }
    return pricesByTokenId[tokenId];
  }
);
