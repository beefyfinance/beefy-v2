import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchPricesAction } from '../actions/prices';
import { TokenEntity } from '../entities/token';

/**
 * State containing price infos indexed by token id
 * We only want to track one price per token, not token implem for now
 */
export interface TokenPriceState {
  byTokenId: {
    // todo: Do we really need a BigNumber
    [tokenId: TokenEntity['id']]: BigNumber;
  };
}
export const initialTokenPriceState: TokenPriceState = { byTokenId: {} };

export const tokenPriceSlice = createSlice({
  name: 'token_price',
  initialState: initialTokenPriceState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when prices are changed, update prices
    // this could also just be a a super quick drop in replacement
    // if we are OK to not use BigNumber, which I don't think we are
    builder.addCase(fetchPricesAction.fulfilled, (sliceState, action) => {
      for (const tokenId of Object.keys(action.payload)) {
        const tokenPrice = action.payload[tokenId];
        // new price, add it
        if (sliceState.byTokenId[tokenId] === undefined) {
          sliceState.byTokenId[tokenId] = new BigNumber(tokenPrice);

          // price exists, update it if it changed
        } else if (sliceState.byTokenId[tokenId].comparedTo(tokenPrice) === 0) {
          sliceState.byTokenId[tokenId] = new BigNumber(tokenPrice);
        }
      }
    });
  },
});
