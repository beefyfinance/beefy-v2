import { createSlice } from '@reduxjs/toolkit';
import { fetchVaultListAction } from '../actions/prices';
import { TokenEntity } from '../entities/token';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type TokensState = NormalizedEntity<TokenEntity>;
const initialState: TokensState = { byId: {}, allIds: [] };

export const tokensSlice = createSlice({
  name: 'tokens',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // TODO: WIP
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchVaultListAction.fulfilled, (state, action) => {
      for (const vault of action.payload.pools) {
        if (state.byId[vault.earnedToken] === undefined) {
          const token: TokenEntity = {
            id: vault.earnedToken,
            symbol: vault.earnedToken,
            //chainId: action.payload.chainId,
            //contractAddress: vault.earnedTokenAddress,
            //decimals: 18, // ????
            // maybe split those because they come later
            //buyUrl: vault.buyTokenUrl, // maybe not ?
            project: null,
            description: '',
            descriptionUrl: '',
          };
          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[token.id] = token;
          state.allIds.push(token.id);
        }

        if (state.byId[vault.token] === undefined) {
          const token: TokenEntity = {
            id: vault.token,
            symbol: vault.token,
            //chainId: action.payload.chainId,
            //contractAddress: vault.tokenAddress,
            //decimals: vault.tokenDecimals,
            //buyUrl: vault.buyTokenUrl,
            project: null,
            description: '',
            descriptionUrl: '',
          };
          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[token.id] = token;
          state.allIds.push(token.id);
        }
      }
    });
  },
});
