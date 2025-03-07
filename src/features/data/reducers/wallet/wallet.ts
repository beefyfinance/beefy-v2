import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ChainEntity } from '../../entities/chain.ts';
import { initWallet } from '../../actions/wallet.ts';

/**
 * Only address and hideBalance are persisted
 */
export type WalletState = {
  initialized: boolean;
  address: string | undefined;
  connectedAddress: string | undefined;
  selectedChainId: ChainEntity['id'] | null;
  error: 'unsupported chain' | null;
  hideBalance: boolean;
};

const initialWalletState: WalletState = {
  initialized: false,
  address: undefined,
  connectedAddress: undefined,
  selectedChainId: null,
  error: null,
  hideBalance: false,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    /**
     * Wallet connection/disconnect actions
     */
    userDidConnect(
      sliceState,
      action: PayloadAction<{
        chainId: ChainEntity['id'];
        address: string;
      }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
    },
    walletHasDisconnected(sliceState) {
      sliceState.address = undefined;
      sliceState.connectedAddress = undefined;
      sliceState.error = null;
    },
    accountHasChanged(
      sliceState,
      action: PayloadAction<{
        address: string;
      }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
    },
    chainHasChanged(
      sliceState,
      action: PayloadAction<{
        chainId: ChainEntity['id'];
        address: string;
      }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
    },
    chainHasChangedToUnsupported(
      sliceState,
      action: PayloadAction<{
        networkChainId: string | number;
        address: string;
      }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
      sliceState.selectedChainId = null;
      sliceState.error = 'unsupported chain';
    },

    /**
     * Display configuration
     */
    setToggleHideBalance(sliceState) {
      sliceState.hideBalance = !sliceState.hideBalance;
    },
  },
  extraReducers: builder => {
    builder.addCase(initWallet.fulfilled, (sliceState, _action) => {
      // wallet connection api initialized
      sliceState.initialized = true;
    });
  },
});

export const {
  walletHasDisconnected,
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  setToggleHideBalance,
} = walletSlice.actions;
