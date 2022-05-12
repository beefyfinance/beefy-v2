import { createSlice } from '@reduxjs/toolkit';
import { fetchBridgeTokenData } from '../actions/bridge';
import { ChainEntity } from '../entities/chain';

export interface BridgeState {
  byChainId: {
    [chainId: ChainEntity['id']]: any;
  };
}

export const initialBridgeState: BridgeState = {
  byChainId: {},
};

export const bridgeSlice = createSlice({
  name: 'bridge',
  initialState: initialBridgeState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchBridgeTokenData.fulfilled, (sliceState, action) => {
      for (const [chainId, value] of Object.entries(action.payload.data)) {
        sliceState.byChainId[chainId] = value;
      }
    });
  },
});
