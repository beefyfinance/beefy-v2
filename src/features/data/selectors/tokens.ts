import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/format';
import { bluechipTokens } from '../../../helpers/utils';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { selectChainById } from './chains';

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

export const selectIsTokenStable = createSelector(
  // get a tiny bit of the data
  selectChainById,
  // get the user params
  (_: BeefyState, __: ChainEntity['id'], tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  (chain, tokenId) => {
    return chain.stableCoins.includes(tokenId);
  }
);

export const selectIsBeefyToken = createSelector(
  // get the user params
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  tokenId => {
    return ['BIFI', 'POTS'].includes(tokenId);
  }
);

export const selectIsTokenBluechip = createSelector(
  // get the user params
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  tokenId => {
    return bluechipTokens.includes(tokenId);
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
        return BIG_ZERO;
      } else {
        throw new Error(`selectTokenPriceByTokenId: Could not find price for token id ${tokenId}`);
      }
    }
    return pricesByTokenId[tokenId];
  }
);
