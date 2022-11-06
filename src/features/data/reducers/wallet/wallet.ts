import { renderIcon } from '@download/blockies';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createCanvas } from 'canvas';
import { ChainEntity } from '../../entities/chain';
import { memoize } from 'lodash';
import { getEns, initWallet } from '../../actions/wallet';

/**
 * Only address, hideBalance and profilePictureUrl are persisted
 */
export type WalletState = {
  initialized: boolean;
  address: string | null;
  ens: string | null;
  connectedAddress: string | null;
  selectedChainId: ChainEntity['id'] | null;
  error: 'unsupported chain' | null;
  hideBalance: boolean;
  profilePictureUrl: null | string;
};

const initialWalletState: WalletState = {
  initialized: false,
  address: null,
  ens: null,
  connectedAddress: null,
  selectedChainId: null,
  error: null,
  hideBalance: false,
  profilePictureUrl: null,
};

const canvas = createCanvas(24, 24);
const _generateProfilePictureUrl = memoize((address: string) => {
  renderIcon({ seed: address.toLowerCase() }, canvas);
  return canvas.toDataURL();
});

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    /**
     * Wallet connection/disconnect actions
     */
    userDidConnect(
      sliceState,
      action: PayloadAction<{ chainId: ChainEntity['id']; address: string }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
      sliceState.profilePictureUrl = _generateProfilePictureUrl(action.payload.address);
    },
    walletHasDisconnected(sliceState) {
      sliceState.address = null;
      sliceState.connectedAddress = null;
      sliceState.profilePictureUrl = null;
      sliceState.error = null;
      sliceState.ens = null;
    },
    accountHasChanged(sliceState, action: PayloadAction<{ address: string }>) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
      sliceState.profilePictureUrl = _generateProfilePictureUrl(action.payload.address);
      sliceState.ens = null;
    },
    chainHasChanged(
      sliceState,
      action: PayloadAction<{ chainId: ChainEntity['id']; address: string }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
      sliceState.profilePictureUrl = _generateProfilePictureUrl(action.payload.address);
    },
    chainHasChangedToUnsupported(
      sliceState,
      action: PayloadAction<{ networkChainId: string | number; address: string }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.connectedAddress = action.payload.address;
      sliceState.selectedChainId = null;
      sliceState.error = 'unsupported chain';
      sliceState.profilePictureUrl = _generateProfilePictureUrl(action.payload.address);
    },
    /**
     * Display configuration
     */
    setToggleHideBalance(sliceState) {
      sliceState.hideBalance = !sliceState.hideBalance;
    },
  },
  extraReducers: builder => {
    builder.addCase(initWallet.fulfilled, (sliceState, action) => {
      // wallet connection api initialized
      sliceState.initialized = true;
    });
    builder.addCase(getEns.fulfilled, (sliceState, action) => {
      sliceState.ens = action.payload;
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
