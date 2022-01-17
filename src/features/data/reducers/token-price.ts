import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchPricesAction } from '../actions/prices';
import { Token } from '../entities/token';

/**
 * State containing price infos indexed by token id
 * We only want to track one price per token, not token implem for now
 */
export interface TokenPriceState {
  // todo: should this be a TokenImplem instead?
  // todo: Do we really need a BigNumber
  [tokenId: Token['id']]: BigNumber;
}
const initialState: TokenPriceState = {};

export const tokenPriceSlice = createSlice({
  name: 'token_price',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when prices are changed, update prices
    // this could also just be a a super quick drop in replacement
    // if we are OK to not use BigNumber, which I don't think we are
    builder.addCase(fetchPricesAction.fulfilled, (state, action) => {
      for (const tokenId of Object.keys(action.payload)) {
        const tokenPrice = action.payload[tokenId];
        // new price, add it
        if (state.byTokenId[tokenId] === undefined) {
          state.byTokenId[tokenId] = new BigNumber(tokenPrice);

          // price exists, update it if it changed
        } else if (state.byTokenId[tokenId].comparedTo(tokenPrice) === 0) {
          state.byTokenId[tokenId] = new BigNumber(tokenPrice);
        }
      }
    });
  },
});
