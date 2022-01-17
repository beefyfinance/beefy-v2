import { createSlice } from '@reduxjs/toolkit';
import { fetchVaultByChainIdAction } from '../actions/vaults';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type TokensState = NormalizedEntity<TokenEntity> & {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenId: {
        [tokenId: TokenEntity['id']]: TokenEntity['id'];
      };
    };
  };
};
export const initialTokensState: TokensState = { byId: {}, allIds: [], byChainId: {} };

export const tokensSlice = createSlice({
  name: 'tokens',
  initialState: initialTokensState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchVaultByChainIdAction.fulfilled, (state, action) => {
      for (const vault of action.payload.pools) {
        const chainId = vault.network;
        if (state.byId[vault.oracleId] === undefined) {
          const token: TokenEntity = {
            id: vault.oracleId,
            chainId: chainId,
            contractAddress: vault.tokenAddress,
            decimals: vault.tokenDecimals,
            symbol: vault.token,
            buyUrl: null,
            type: 'erc20',
          };
          state.byId[token.id] = token;
          state.allIds.push(token.id);
          if (state.byChainId[chainId] === undefined) {
            state.byChainId[chainId] = { byTokenId: {} };
          }
          state.byChainId[chainId].byTokenId[vault.token] = token.id;
        }

        // add earned token data
        const earnedTokenId = chainId + '-' + vault.earnedToken;
        if (state.byId[earnedTokenId] === undefined) {
          const token: TokenEntity = {
            id: earnedTokenId,
            chainId: chainId,
            contractAddress: vault.earnedTokenAddress,
            decimals: 18, // TODO: not sure about that
            symbol: vault.earnedToken,
            buyUrl: null,
            type: 'erc20',
          };
          state.byId[token.id] = token;
          state.allIds.push(token.id);
          if (state.byChainId[chainId] === undefined) {
            state.byChainId[chainId] = { byTokenId: {} };
          }
          state.byChainId[chainId].byTokenId[vault.earnedToken] = token.id;
        }
      }
    });
  },
});
