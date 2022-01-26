import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';

/**
 * State containing Vault infos
 */
export type WalletState = {
  address: string | null;
  selectedChainId: ChainEntity['id'] | null;
  error: 'unsupported chain' | null;
};
export const initialWalletState: WalletState = {
  address: null,
  selectedChainId: null,
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    userDidConnect(
      sliceState,
      action: PayloadAction<{ chainId: ChainEntity['id']; address: string }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
    },
    walletHasDisconnected(sliceState) {
      sliceState.address = null;
    },
    accountHasChanged(sliceState, action: PayloadAction<{ address: string }>) {
      sliceState.address = action.payload.address;
    },
    chainHasChanged(sliceState, action: PayloadAction<{ chainId: ChainEntity['id'] }>) {
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
    },
    chainHasChangedToUnsupported(sliceState) {
      sliceState.selectedChainId = null;
      sliceState.error = 'unsupported chain';
    },
  },
  extraReducers: builder => {},
});

export const {
  walletHasDisconnected,
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
} = walletSlice.actions;
