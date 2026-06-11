import { getWalletConnectionApi } from '../apis/instances.ts';
import type { ChainEntity } from '../entities/chain.ts';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet.ts';
import { selectAllChains } from '../selectors/chains.ts';
import { selectIsInMiniApp, selectIsWalletConnected } from '../selectors/wallet.ts';
import {
  featureFlag_walletAddressOverride,
  featureFlag_walletDebug,
} from '../utils/feature-flags.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { transactSetSuccessClosed } from './transact.ts';
import { stepperReset } from './wallet/stepper.ts';
import { createWalletActionResetAction } from './wallet/wallet-action.ts';
import { selectHasWalletInitialized } from '../selectors/data-loader/wallet.ts';
import type { BeefyState } from '../store/types.ts';

function debugWalletState(state: BeefyState, event: string, payload?: unknown) {
  if (featureFlag_walletDebug()) {
    const { address, connectedAddress } = state.user.wallet;
    console.debug(
      `[wallet ${(performance.now() / 1000).toFixed(3)}s]`,
      event,
      payload ?? '',
      `(before: address=${address}, connectedAddress=${connectedAddress})`
    );
  }
}

export const initWallet = createAppAsyncThunk(
  'wallet/initWallet',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const chains = selectAllChains(state);

    // instantiate and do the proper piping between both worlds
    const walletApi = await getWalletConnectionApi({
      chains,
      onConnect: (chainId, address) => {
        debugWalletState(getState(), 'onConnect', { chainId, address });
        dispatch(userDidConnect({ chainId, address: featureFlag_walletAddressOverride(address) }));
      },
      onAccountChanged: address => {
        debugWalletState(getState(), 'onAccountChanged', { address });
        dispatch(accountHasChanged({ address: featureFlag_walletAddressOverride(address) }));
      },
      onChainChanged: (chainId, address) => {
        debugWalletState(getState(), 'onChainChanged', { chainId, address });
        dispatch(chainHasChanged({ chainId, address: featureFlag_walletAddressOverride(address) }));
      },
      onUnsupportedChainSelected: (networkChainId, address) => {
        debugWalletState(getState(), 'onUnsupportedChainSelected', { networkChainId, address });
        dispatch(
          chainHasChangedToUnsupported({
            networkChainId,
            address: featureFlag_walletAddressOverride(address),
          })
        );
      },
      onWalletDisconnected: () => {
        debugWalletState(getState(), 'onWalletDisconnected: dispatching reset bundle');
        if (featureFlag_walletDebug()) {
          console.trace('[wallet] onWalletDisconnected call stack');
        }
        dispatch(createWalletActionResetAction());
        dispatch(transactSetSuccessClosed(false));
        dispatch(stepperReset());
        dispatch(walletHasDisconnected());
      },
    });

    setTimeout(() => {
      if (selectIsInMiniApp(getState())) {
        walletApi.setAutoConnectToEip6936(true);
      }
      dispatch(tryToAutoReconnect());
    }, 500);
  }
);

export const tryToAutoReconnect = createAppAsyncThunk(
  'wallet/tryToAutoReconnect',
  async (_, { getState }) => {
    const state = getState();
    if (!selectIsWalletConnected(state)) {
      debugWalletState(state, 'tryToAutoReconnect: attempting');
      const walletConnection = await getWalletConnectionApi();
      await walletConnection.tryToAutoReconnect();
    }
  }
);

export const tryToAutoConnectToEip6936Wallet = createAppAsyncThunk(
  'wallet/tryToAutoConnectToEip6936Wallet',
  async (_, { getState }) => {
    const state = getState();
    if (selectIsWalletConnected(state) || !selectHasWalletInitialized(state)) {
      return;
    }

    const walletConnection = await getWalletConnectionApi();
    walletConnection.setAutoConnectToEip6936();
    await walletConnection.tryToAutoReconnect();
  }
);

export const askForWalletConnection = createAppAsyncThunk(
  'wallet/askForWalletConnection',
  async (_, { getState }) => {
    try {
      debugWalletState(getState(), 'askForWalletConnection: starting');
      const walletConnection = await getWalletConnectionApi();
      await walletConnection.askUserToConnectIfNeeded();
    } catch (err) {
      console.error('askForWalletConnection', err);
      throw err;
    }
  }
);

export const doDisconnectWallet = createAppAsyncThunk('wallet/doDisconnectWallet', async () => {
  const walletConnection = await getWalletConnectionApi();
  await walletConnection.disconnect();
});

export const askForNetworkChange = createAppAsyncThunk<
  void,
  {
    chainId: ChainEntity['id'];
  }
>('wallet/askForNetworkChange', async ({ chainId }) => {
  const walletConnection = await getWalletConnectionApi();
  await walletConnection.askUserForChainChange(chainId);
});
