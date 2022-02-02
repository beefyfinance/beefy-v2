import { createSelector } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BeefyState } from '../../redux/reducers/storev2';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

export const selectAllTokenByChain = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.tokens.byChainId,
  // get the user params
  (_: BeefyState, chainId: ChainEntity['id']) => chainId,
  // last function receives previous function outputs as parameters
  (byChainId, chainId) => {
    if (byChainId[chainId] === undefined) {
      throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
    }
    return byChainId[chainId].allIds;
  }
);

export const selectTokenById = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.tokens.byChainId,
  // get the user params
  (_: BeefyState, chainId: ChainEntity['id'], tokenId: TokenEntity['id']) => ({ chainId, tokenId }),
  // last function receives previous function outputs as parameters
  (byChainId, { chainId, tokenId }) => {
    if (byChainId[chainId] === undefined) {
      throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
    }
    if (byChainId[chainId].byId[tokenId] === undefined) {
      throw new Error(`selectTokenById: Unknown token id ${tokenId} for chain ${chainId}`);
    }
    return byChainId[chainId].byId[tokenId];
  }
);

/**
 * These are tokens we are not expecting to find in the /lp or /prices API
 * We don't want to fail if we query price for those tokens
 */
const deprecatedTokenIds = [
  'blizzard-blzd-bnb',
  'blizzard-blzd-busd',
  'BLZD',
  'nyanswop-nyas-usdt',
  'boo-wftm-dola',
];

export const selectTokenPriceByTokenId = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.tokens.prices.byTokenId,
  // get the user passed ID
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  (pricesByTokenId, tokenId) => {
    if (pricesByTokenId[tokenId] === undefined) {
      if (deprecatedTokenIds.includes(tokenId)) {
        // if price is not in the api, it's rug and value is 0
        console.debug(
          `selectTokenPriceByTokenId: querying price for a deprecated token: ${tokenId}`
        );
        return new BigNumber(0);
      } else {
        throw new Error(`selectTokenPriceByTokenId: Could not find price for token id ${tokenId}`);
      }
    }
    return pricesByTokenId[tokenId];
  }
);
