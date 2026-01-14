import {
  connectCancelled,
  connectConnecting,
  connectDisplayQr,
  connectError,
  connectSuccess,
  walletAccountChanged,
  walletOptionsChanged,
} from '../reducers/wallet/wallet.ts';
import { selectAllChains } from '../selectors/chains.ts';
import {
  selectIsInMiniApp,
  selectIsWalletConnected,
  selectWalletAccount,
  selectWalletRecent,
} from '../selectors/wallet.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { stepperReset } from './wallet/stepper.ts';
import { createWalletActionResetAction } from './wallet/wallet-action.ts';
import { selectHasWalletInitialized } from '../selectors/data-loader/wallet.ts';
import { walletsConfig } from '../apis/wallet/wallets.ts';
import type { WalletOption } from '../apis/wallet/wallet-connection-types.ts';
import type { WalletAccount } from '../reducers/wallet/wallet-types.ts';
import {
  disposeWalletConnectionApi,
  getWalletConnectionApi,
  initWalletConnectionApi,
} from '../apis/wallet/instance.ts';
import { createAction } from '@reduxjs/toolkit';
import type { Address } from 'viem';
import type { ChainEntity } from '../apis/chains/entity-types.ts';

export const initWallet = createAppAsyncThunk<void, boolean | undefined>(
  'wallet/initWallet',
  async (reinit = false, { getState, dispatch }) => {
    const state = getState();
    const chains = selectAllChains(state);
    if (reinit) {
      disposeWalletConnectionApi();
    }
    await initWalletConnectionApi({
      wallets: walletsConfig,
      chains,
      events: {
        onAccountChange: (account: WalletAccount) => {
          console.debug('onAccountChange', account);
          const prev = selectWalletAccount(getState());
          const userChanged = prev.address !== account.address;
          if (account.isDisconnected) {
            dispatch(createWalletActionResetAction());
            dispatch(stepperReset());
          }
          dispatch(walletAccountChanged(account));
          if (userChanged) {
            dispatch(walletUserChanged({ address: account.address, prevAddress: prev.address }));
          }
        },
        onOptionsChange: (options: WalletOption[]) => {
          console.debug('onOptionsChange', options);
          dispatch(walletOptionsChanged(options));
        },
        onConnectConnecting: data => {
          dispatch(connectConnecting(data));
        },
        onConnectDisplayQr: data => {
          dispatch(connectDisplayQr(data));
        },
        onConnectSuccess: data => {
          dispatch(connectSuccess(data));
        },
        onConnectCancelled: data => {
          dispatch(connectCancelled(data));
        },
        onConnectError: data => {
          dispatch(connectError(data));
        },
      },
    });

    setTimeout(() => {
      if (selectIsInMiniApp(getState())) {
        // walletApi.setAutoConnectToEip6936(true);
      }
      dispatch(walletAutoConnect());
    }, 500);
  }
);

export const walletUserChanged = createAction<{ address?: Address; prevAddress?: Address }>(
  'wallet/userChanged'
);

export const walletAutoConnect = createAppAsyncThunk(
  'wallet/autoConnect',
  async (_, { getState }) => {
    const state = getState();
    if (selectIsWalletConnected(state)) {
      return;
    }
    const { walletId, connectorId } = selectWalletRecent(state);
    const walletConnection = getWalletConnectionApi();
    await walletConnection.reconnect({ walletId, connectorId, autoConnect: true });
  }
);

export const tryToAutoConnectToEip6936Wallet = createAppAsyncThunk(
  'wallet/tryToAutoConnectToEip6936Wallet',
  async (_, { getState }) => {
    const state = getState();
    if (selectIsWalletConnected(state) || !selectHasWalletInitialized(state)) {
      return;
    }

    const walletConnection = getWalletConnectionApi();
    await walletConnection.reconnect({ autoConnect: true });
  }
);

export const walletDisconnect = createAppAsyncThunk('wallet/disconnect', async () => {
  const walletConnection = getWalletConnectionApi();
  await walletConnection.disconnect();
});

export const walletChangeNetwork = createAppAsyncThunk<
  void,
  {
    chainId: ChainEntity['id'];
  }
>('wallet/changeNetwork', async ({ chainId }) => {
  const walletConnection = getWalletConnectionApi();
  await walletConnection.askUserForChainChange(chainId);
});

export const walletConnectTo = createAppAsyncThunk<
  boolean,
  {
    id: string;
    chainId?: ChainEntity['id'];
  }
>('wallet/connectTo', async ({ id, chainId }, { requestId }) => {
  const walletConnection = getWalletConnectionApi();
  return await walletConnection.connect({ walletId: id, chainId, requestId });
});

export const walletSelectOpen = createAppAsyncThunk('wallet/selectOpen', async () => {
  const walletConnection = getWalletConnectionApi();
  walletConnection.cancelConnect();
});

export const walletSelectClose = createAppAsyncThunk('wallet/selectClose', async _ => {
  const walletConnection = getWalletConnectionApi();
  walletConnection.cancelConnect();
});

export const walletSelectBack = createAppAsyncThunk('wallet/selectBack', async () => {
  const walletConnection = getWalletConnectionApi();
  walletConnection.cancelConnect();
});
