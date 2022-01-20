import { createSelector } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { BeefyState } from '../state';

export const selectAllowanceByTokenId = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.allowance.byChainId,
  // get the user parameters
  (_: BeefyState, chainId: ChainEntity['id']) => chainId,
  (_: BeefyState, tokenId: TokenEntity['id']) => tokenId,
  // last function receives previous function outputs as parameters
  (allowanceByChainId, chainId, tokenId) => {
    if (allowanceByChainId[chainId] === undefined) {
      throw new Error(`Could not find allowances for chain id ${chainId}`);
    }
    if (allowanceByChainId[chainId].byTokenId[tokenId] === undefined) {
      throw new Error(`Could not find allowances for chain id ${chainId} for token ${tokenId}`);
    }
    return allowanceByChainId[chainId].byTokenId[tokenId];
  }
);
