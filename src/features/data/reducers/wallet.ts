import { createSlice } from '@reduxjs/toolkit';

/**
 * State containing Vault infos
 */
export type WalletState = { address: string | null };
export const initialWalletState: WalletState = {
  address: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {},
});
