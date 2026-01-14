import {
  createSlice,
  miniSerializeError,
  type PayloadAction,
  type WritableDraft,
} from '@reduxjs/toolkit';
import type { WalletState } from './wallet-types.ts';
import {
  tryToAutoConnectToEip6936Wallet,
  walletConnectTo,
  walletDisconnect,
  walletSelectBack,
  walletSelectClose,
  walletSelectOpen,
} from '../../actions/wallet.ts';
import type {
  ConnectCancelled,
  ConnectConnecting,
  ConnectDisplayQR,
  ConnectError,
  ConnectSuccess,
  WalletOption,
} from '../../apis/wallet/wallet-connection-types.ts';

const initialWalletState: WalletState = {
  address: undefined,
  account: {
    address: undefined,
    addresses: undefined,
    chainId: undefined,
    networkChainId: undefined,
    connector: undefined,
    isConnected: false,
    isReconnecting: false,
    isConnecting: false,
    isDisconnected: true,
    status: 'disconnected',
  },
  recent: {
    address: undefined,
    chainId: undefined,
    walletId: undefined,
    connectorId: undefined,
  },
  options: [],
  select: {
    open: false,
  },
  settings: {
    hideBalance: false,
  },
  isInMiniApp: false,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState: initialWalletState,
  reducers: {
    accountChanged(sliceState, action: PayloadAction<WalletState['account']>) {
      // @dev cast as WriteableDraft does not like nested readonly types
      sliceState.account = action.payload as WritableDraft<WalletState['account']>;
      if (action.payload.address) {
        sliceState.address = action.payload.address;
        sliceState.recent.address = action.payload.address;
      }
      if (action.payload.chainId) {
        sliceState.recent.chainId = action.payload.chainId;
      }
    },
    optionsChanged(sliceState, action: PayloadAction<WalletOption[]>) {
      // @dev cast as WriteableDraft does not like nested readonly types
      sliceState.options = action.payload as WritableDraft<WalletState['options']>;
    },
    connectConnecting(sliceState, action: PayloadAction<ConnectConnecting>) {
      if (
        sliceState.select.open &&
        (sliceState.select.step === 'wallet' ||
          sliceState.select.requestId === action.payload.requestId)
      ) {
        sliceState.select = {
          open: true,
          step: 'connecting',
          requestId: action.payload.requestId,
          wallet: action.payload.wallet as WritableDraft<WalletOption>,
          qr: undefined,
        };
      } else {
        console.debug('ignored connectConnecting', sliceState.select, action.payload);
      }
    },
    connectDisplayQr(sliceState, action: PayloadAction<ConnectDisplayQR>) {
      if (
        sliceState.select.open &&
        sliceState.select.step === 'connecting' &&
        sliceState.select.requestId === action.payload.requestId
      ) {
        sliceState.select.qr = action.payload.uri;
      } else {
        console.debug('ignored connectDisplayQr', sliceState.select, action.payload);
      }
    },
    connectSuccess(sliceState, action: PayloadAction<ConnectSuccess>) {
      if (
        sliceState.select.open &&
        sliceState.select.step === 'connecting' &&
        sliceState.select.requestId === action.payload.requestId
      ) {
        // close on success
        sliceState.select = {
          open: false,
        };
        // track recent wallet
        sliceState.recent.walletId = action.payload.wallet.id;
      } else {
        console.debug('ignored connectSuccess', sliceState.select, action.payload);
      }
    },
    connectCancelled(sliceState, action: PayloadAction<ConnectCancelled>) {
      if (
        sliceState.select.open &&
        sliceState.select.step === 'connecting' &&
        sliceState.select.requestId === action.payload.requestId
      ) {
        // back to list on cancel
        sliceState.select = {
          open: true,
          step: 'wallet',
        };
      } else {
        console.debug('ignored connectCancelled', sliceState.select, action.payload);
      }
    },
    connectError(sliceState, action: PayloadAction<ConnectError>) {
      if (
        sliceState.select.open &&
        sliceState.select.step === 'connecting' &&
        sliceState.select.requestId === action.payload.requestId
      ) {
        // back to list on cancel
        sliceState.select = {
          ...sliceState.select,
          step: 'error',
          requestId: action.payload.requestId,
          error: miniSerializeError(action.payload.error),
        };
      } else {
        console.debug('ignored connectError', sliceState.select, action.payload);
      }
    },
    /**
     * Display configuration
     */
    setToggleHideBalance(sliceState) {
      sliceState.settings.hideBalance = !sliceState.settings.hideBalance;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(tryToAutoConnectToEip6936Wallet.pending, sliceState => {
        sliceState.isInMiniApp = true;
      })
      .addCase(walletSelectOpen.pending, sliceState => {
        sliceState.select = {
          open: true,
          step: 'wallet',
        };
      })
      .addCase(walletConnectTo.rejected, (sliceState, action) => {
        if (
          sliceState.select.open &&
          sliceState.select.step === 'connecting' &&
          sliceState.select.requestId === action.meta.requestId
        ) {
          sliceState.select = {
            ...sliceState.select,
            step: 'error',
            error: action.error,
          };
        }
      })
      .addCase(walletSelectClose.fulfilled, sliceState => {
        sliceState.select = {
          open: false,
        };
      })
      .addCase(walletSelectBack.fulfilled, sliceState => {
        sliceState.select = {
          open: true,
          step: 'wallet',
        };
      })
      .addCase(walletDisconnect.fulfilled, sliceState => {
        sliceState.address = undefined;
      });
  },
});

export const {
  setToggleHideBalance,
  connectConnecting,
  connectDisplayQr,
  connectSuccess,
  connectCancelled,
  connectError,
} = walletSlice.actions;

export const walletAccountChanged = walletSlice.actions.accountChanged;
export const walletOptionsChanged = walletSlice.actions.optionsChanged;
