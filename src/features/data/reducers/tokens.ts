import { createSlice } from '@reduxjs/toolkit';
import { fetchVaultByChainIdAction } from '../actions/vaults';
import { ChainEntity } from '../entities/chain';
import { TokenEntity, TokenImplemEntity } from '../entities/token';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type TokensState = {
  tokens: NormalizedEntity<TokenEntity>;
  implems: NormalizedEntity<TokenImplemEntity> & {
    byChainId: {
      [chainId: ChainEntity['id']]: {
        byTokenId: {
          [tokenId: TokenEntity['id']]: TokenImplemEntity['id'];
        };
      };
    };
  };
};
export const initialTokensState: TokensState = {
  tokens: { byId: {}, allIds: [] },
  implems: { byId: {}, allIds: [], byChainId: {} },
};

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
        // add vault token data
        if (state.tokens.byId[vault.token] === undefined) {
          const token: TokenEntity = {
            id: vault.token,
            symbol: vault.token,
            tokenDescription: vault.tokenDescription,
            tokenDescriptionUrl: vault.tokenDescriptionUrl,
            isBoost: false,
          };
          state.tokens.byId[token.id] = token;
          state.tokens.allIds.push(token.id);
        }
        if (state.tokens.byId[vault.oracleId] === undefined) {
          const tokenImplem: TokenImplemEntity = {
            id: vault.oracleId,
            chainId: chainId,
            contractAddress: vault.tokenAddress,
            decimals: vault.tokenDecimals,
            tokenId: vault.earnedToken,
            buyUrl: null,
            type: 'erc20',
          };
          state.implems.byId[tokenImplem.id] = tokenImplem;
          state.implems.allIds.push(tokenImplem.id);
          if (state.implems.byChainId[chainId] === undefined) {
            state.implems.byChainId[chainId] = { byTokenId: {} };
          }
          state.implems.byChainId[chainId].byTokenId[vault.token] = tokenImplem.id;
        }

        // add earned token data
        if (state.tokens.byId[vault.earnedToken] === undefined) {
          const token: TokenEntity = {
            id: vault.earnedToken,
            symbol: vault.earnedToken,
            isBoost: false,
            tokenDescription: null,
            tokenDescriptionUrl: null,
          };
          state.tokens.byId[token.id] = token;
          state.tokens.allIds.push(token.id);
        }
        const earnedTokenImplemId = chainId + '-' + vault.earnedToken;
        if (state.implems.byId[earnedTokenImplemId] === undefined) {
          const tokenImplem: TokenImplemEntity = {
            id: earnedTokenImplemId,
            chainId: chainId,
            contractAddress: vault.earnedTokenAddress,
            decimals: 18, // TODO: not sure about that
            tokenId: vault.earnedToken,
            buyUrl: null,
            type: 'erc20',
          };
          state.implems.byId[tokenImplem.id] = tokenImplem;
          state.implems.allIds.push(tokenImplem.id);
          if (state.implems.byChainId[chainId] === undefined) {
            state.implems.byChainId[chainId] = { byTokenId: {} };
          }
          state.implems.byChainId[chainId].byTokenId[vault.earnedToken] = tokenImplem.id;
        }
      }
    });
  },
});
