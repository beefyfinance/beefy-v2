import { renderIcon } from '@download/blockies';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createCanvas } from 'canvas';
import { ChainEntity } from '../entities/chain';

/**
 * State containing Vault infos
 */
export type WalletState = {
  address: string | null;
  selectedChainId: ChainEntity['id'] | null;
  error: 'unsupported chain' | null;
  hideBalance: boolean;
  profilePictureUrl: null | string;
};
export const initialWalletState: WalletState = {
  address: null,
  selectedChainId: null,
  error: null,
  hideBalance: false,
  profilePictureUrl: null,
};

const canvas = createCanvas(24, 24);
function _generateProfilePictureUrl(address: string) {
  renderIcon({ seed: address.toLowerCase() }, canvas);
  return canvas.toDataURL();
}

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    /**
     * web3Modal has a cache on it's own, this action
     * sole purpose is to synchronise the modal cache with our redux state
     */
    initWalletState(
      sliceState,
      action: PayloadAction<null | { chainId: ChainEntity['id'] | null; address: string }>
    ) {
      // there is no local web3Modal cache, disconnect
      if (action.payload === null) {
        sliceState.address = null;
        sliceState.error = null;
        sliceState.selectedChainId = null;
        sliceState.profilePictureUrl = null;
      } else {
        sliceState.address = action.payload.address;
        // keep local storage chain if any
        sliceState.selectedChainId =
          action.payload.chainId === null ? sliceState.selectedChainId : null;
        sliceState.profilePictureUrl = _generateProfilePictureUrl(action.payload.address);
        sliceState.error = action.payload.chainId === null ? 'unsupported chain' : null;
      }
    },

    /**
     * Wallet connection/disconnect actions
     */
    userDidConnect(
      sliceState,
      action: PayloadAction<{ chainId: ChainEntity['id']; address: string }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
      sliceState.profilePictureUrl = _generateProfilePictureUrl(action.payload.address);
    },
    walletHasDisconnected(sliceState) {
      sliceState.address = null;
      sliceState.profilePictureUrl = null;
      sliceState.error = null;
    },
    accountHasChanged(sliceState, action: PayloadAction<{ address: string }>) {
      sliceState.address = action.payload.address;
      sliceState.profilePictureUrl = _generateProfilePictureUrl(action.payload.address);
    },
    chainHasChanged(
      sliceState,
      action: PayloadAction<{ chainId: ChainEntity['id']; address: string }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.selectedChainId = action.payload.chainId;
      sliceState.error = null;
    },
    chainHasChangedToUnsupported(
      sliceState,
      action: PayloadAction<{ networkChainId: string | number; address: string }>
    ) {
      sliceState.address = action.payload.address;
      sliceState.error = 'unsupported chain';
    },
    /**
     * Display configuration
     */
    setToggleHideBalance(sliceState) {
      sliceState.hideBalance = !sliceState.hideBalance;
    },
  },
});

export const {
  walletHasDisconnected,
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  setToggleHideBalance,
  initWalletState,
} = walletSlice.actions;
