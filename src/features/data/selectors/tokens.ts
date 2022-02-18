import { createSelector } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../helpers/format';
import { bluechipTokens } from '../../../helpers/utils';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { isTokenErc20, TokenEntity } from '../entities/token';
import { selectChainById } from './chains';

export const selectAllTokenByChain = (state: BeefyState, chainId: ChainEntity['id']) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
  }
  return byChainId[chainId].allIds;
};

export const selectTokenById = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const byChainId = state.entities.tokens.byChainId;
  if (byChainId[chainId] === undefined) {
    throw new Error(`selectTokenById: Unknown chain id ${chainId}`);
  }
  if (byChainId[chainId].byId[tokenId] === undefined) {
    throw new Error(`selectTokenById: Unknown token id ${tokenId} for chain ${chainId}`);
  }
  return byChainId[chainId].byId[tokenId];
};

export const selectAddressBookTokenById = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const addressBook = state.entities.tokens.addressBook;
  if (addressBook[chainId] === undefined) {
    throw new Error(`selectAddressBookTokenById: Unknown chain id ${chainId}`);
  }
  if (addressBook[chainId].byId[tokenId] === undefined) {
    throw new Error(`selectAddressBookTokenById: Unknown token id ${tokenId} for chain ${chainId}`);
  }
  return addressBook[chainId].byId[tokenId];
};

export const selectAddressBookNativeToken = (state: BeefyState, chainId: ChainEntity['id']) => {
  const addressBook = state.entities.tokens.addressBook;
  if (addressBook[chainId] === undefined) {
    throw new Error(`selectAddressBookNativeToken: Unknown chain id ${chainId}`);
  }
  if (!addressBook[chainId].native) {
    throw new Error(`selectAddressBookNativeToken: Empty native token for chain id ${chainId}`);
  }
  if (addressBook[chainId].byId[addressBook[chainId].native] === undefined) {
    throw new Error(
      `selectAddressBookNativeToken: Unknown token id ${addressBook[chainId].native} for chain ${chainId}`
    );
  }
  return addressBook[chainId].byId[addressBook[chainId].native];
};

export const selectAddressBookWrappedNativeToken = (
  state: BeefyState,
  chainId: ChainEntity['id']
) => {
  const addressBook = state.entities.tokens.addressBook;
  if (addressBook[chainId] === undefined) {
    throw new Error(`selectAddressBookNativeToken: Unknown chain id ${chainId}`);
  }
  if (!addressBook[chainId].wnative) {
    throw new Error(`selectAddressBookNativeToken: Empty native token for chain id ${chainId}`);
  }
  if (addressBook[chainId].byId[addressBook[chainId].wnative] === undefined) {
    throw new Error(
      `selectAddressBookNativeToken: Unknown token id ${addressBook[chainId].wnative} for chain ${chainId}`
    );
  }
  return addressBook[chainId].byId[addressBook[chainId].wnative];
};

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

export const selectTokenPriceByTokenId = (state: BeefyState, tokenId: TokenEntity['id']) =>
  state.entities.tokens.prices.byTokenId[tokenId] || BIG_ZERO;
