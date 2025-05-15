import { createSlice } from '@reduxjs/toolkit';
import { addTokenToWalletAction } from '../actions/add-to-wallet.ts';
import type { AddToWalletState } from './add-to-wallet-types.ts';

const initialAddToWalletState: AddToWalletState = {
  status: 'idle',
  requestId: null,
  token: null,
  iconUrl: null,
  error: null,
};

export const addToWalletSlice = createSlice({
  name: 'addToWallet',
  initialState: initialAddToWalletState,
  reducers: {
    close: sliceState => {
      sliceState.status = 'idle';
      sliceState.requestId = null;
      sliceState.token = null;
      sliceState.iconUrl = null;
      sliceState.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addTokenToWalletAction.pending, (sliceState, action) => {
        sliceState.status = 'pending';
        sliceState.requestId = action.meta.requestId;
        sliceState.token = null;
        sliceState.iconUrl = null;
        sliceState.error = null;
      })
      .addCase(addTokenToWalletAction.rejected, (sliceState, action) => {
        if (sliceState.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.status = 'rejected';
        sliceState.error = action.error;
      })
      .addCase(addTokenToWalletAction.fulfilled, (sliceState, action) => {
        if (sliceState.requestId !== action.meta.requestId) {
          return;
        }
        sliceState.status = 'fulfilled';
        sliceState.token = action.payload.token;
        sliceState.iconUrl = action.payload.iconUrl;
      });
  },
});

export const addToWalletActions = addToWalletSlice.actions;
