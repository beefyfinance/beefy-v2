import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchBoostsByChainIdAction } from '../actions/boosts';
import { fetchLPPricesAction, fetchPricesAction } from '../actions/prices';
import { fetchVaultByChainIdAction } from '../actions/vaults';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

/**
 * State containing Vault infos
 */
export type TokensState = {
  // we need to split by chain because tokens from different chains have the same ids
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byId: {
        [id: string]: TokenEntity;
      };
      allIds: string[];
    };
  };
  prices: {
    byTokenId: {
      [tokenId: TokenEntity['id']]: BigNumber;
    };
  };
};
export const initialTokensState: TokensState = { byChainId: {}, prices: { byTokenId: {} } };
export const tokensSlice = createSlice({
  name: 'tokens',
  initialState: initialTokensState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchVaultByChainIdAction.fulfilled, (sliceState, action) => {
      for (const vault of action.payload.pools) {
        const chainId = vault.network;
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byId: {}, allIds: [] };
        }

        if (sliceState.byChainId[chainId].byId[vault.oracleId] === undefined) {
          const token: TokenEntity = {
            id: vault.oracleId,
            chainId: chainId,
            contractAddress: vault.tokenAddress,
            decimals: vault.tokenDecimals,
            symbol: vault.token,
            buyUrl: null,
            type: 'erc20',
          };
          sliceState.byChainId[chainId].byId[token.id] = token;
          sliceState.byChainId[chainId].allIds.push(token.id);
        }

        // add earned token data
        const earnedTokenId = vault.earnedToken;
        if (sliceState.byChainId[chainId].byId[earnedTokenId] === undefined) {
          const token: TokenEntity = {
            id: earnedTokenId,
            chainId: chainId,
            contractAddress: vault.earnedTokenAddress,
            decimals: 18, // TODO: not sure about that
            symbol: vault.earnedToken,
            buyUrl: null,
            type: 'erc20',
          };
          sliceState.byChainId[chainId].byId[token.id] = token;
          sliceState.byChainId[chainId].allIds.push(token.id);
        }
      }
    });

    // when boost list is fetched, add all new tokens
    builder.addCase(fetchBoostsByChainIdAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;
      for (const boost of action.payload.boosts) {
        if (sliceState.byChainId[chainId] === undefined) {
          sliceState.byChainId[chainId] = { byId: {}, allIds: [] };
        }

        if (sliceState.byChainId[chainId].byId[boost.earnedOracleId] === undefined) {
          const token: TokenEntity = {
            id: boost.earnedOracleId,
            chainId: chainId,
            contractAddress: boost.earnedTokenAddress,
            decimals: boost.earnedTokenDecimals,
            symbol: boost.earnedToken,
            buyUrl: null,
            type: 'erc20',
          };
          sliceState.byChainId[chainId].byId[token.id] = token;
          sliceState.byChainId[chainId].allIds.push(token.id);
        }
      }
    });

    // when prices are changed, update prices
    // this could also just be a a super quick drop in replacement
    // if we are OK to not use BigNumber, which I don't think we are
    builder.addCase(fetchPricesAction.fulfilled, (sliceState, action) => {
      for (const tokenId of Object.keys(action.payload)) {
        const tokenPrice = action.payload[tokenId];
        // new price, add it
        if (sliceState.prices.byTokenId[tokenId] === undefined) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);

          // price exists, update it if it changed
        } else if (sliceState.prices.byTokenId[tokenId].comparedTo(tokenPrice) === 0) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);
        }
      }
    });

    /**
     * Same thing for LP prices
     * Might be smart to not have a single state where all prices
     * are stored, but for now it's ok
     */
    builder.addCase(fetchLPPricesAction.fulfilled, (sliceState, action) => {
      for (const tokenId of Object.keys(action.payload)) {
        const tokenPrice = action.payload[tokenId];
        // new price, add it
        if (sliceState.prices.byTokenId[tokenId] === undefined) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);

          // price exists, update it if it changed
        } else if (sliceState.prices.byTokenId[tokenId].comparedTo(tokenPrice) === 0) {
          sliceState.prices.byTokenId[tokenId] = new BigNumber(tokenPrice);
        }
      }
    });
  },
});
