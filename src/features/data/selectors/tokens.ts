import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

export const selectTokenById = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.tokens.byChainId,
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
