import { createSlice } from '@reduxjs/toolkit';
import { fetchBridgeTokenData } from '../../actions/bridge';

export interface BridgeState {}

export const initialBridgeState: BridgeState = {};

export const bridgeSlice = createSlice({
  name: 'bridge',
  initialState: initialBridgeState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchBridgeTokenData.fulfilled, (sliceState, action) => {
      console.log(action.payload.data);
    });
  },
});
