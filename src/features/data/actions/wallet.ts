import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
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
import { featureFlag_walletAddressOverride } from '../utils/feature-flags.ts';
import { selectIsWalletConnected } from '../selectors/wallet.ts';
import { createWalletActionResetAction } from '../reducers/wallet/wallet-action.ts';
import { stepperActions } from '../reducers/wallet/stepper.ts';

export const initWallet = createAsyncThunk<
  void,
  void,
  {
    state: BeefyState;
  }
>('wallet/initWallet', async (_, { getState, dispatch }) => {
  const state = getState();
  const chains = selectAllChains(state);

  // instantiate and do the proper piping between both worlds
  await getWalletConnectionApi({
    chains,
    onConnect: (chainId, address) =>
      dispatch(userDidConnect({ chainId, address: featureFlag_walletAddressOverride(address) })),
    onAccountChanged: address =>
      dispatch(accountHasChanged({ address: featureFlag_walletAddressOverride(address) })),
    onChainChanged: (chainId, address) =>
      dispatch(chainHasChanged({ chainId, address: featureFlag_walletAddressOverride(address) })),
    onUnsupportedChainSelected: (networkChainId, address) =>
      dispatch(
        chainHasChangedToUnsupported({
          networkChainId,
          address: featureFlag_walletAddressOverride(address),
        })
      ),
    onWalletDisconnected: () => {
      dispatch(createWalletActionResetAction());
      dispatch(stepperActions.reset());
      dispatch(walletHasDisconnected());
    },
  });

  setTimeout(() => {
    dispatch(tryToAutoReconnect());
  }, 500);
});

export const tryToAutoReconnect = createAsyncThunk<
  void,
  void,
  {
    state: BeefyState;
  }
>('wallet/tryToAutoReconnect', async (_, { getState }) => {
  const state = getState();
  if (!selectIsWalletConnected(state)) {
    const walletConnection = await getWalletConnectionApi();
    await walletConnection.tryToAutoReconnect();
  }
});

export const askForWalletConnection = createAsyncThunk(
  'wallet/askForWalletConnection',
  async () => {
    try {
      const walletConnection = await getWalletConnectionApi();
      await walletConnection.askUserToConnectIfNeeded();
    } catch (err) {
      console.error('askForWalletConnection', err);
      throw err;
    }
  }
);

export const doDisconnectWallet = createAsyncThunk('wallet/doDisconnectWallet', async () => {
  const walletConnection = await getWalletConnectionApi();
  await walletConnection.disconnect();
});

export const askForNetworkChange = createAsyncThunk<
  void,
  {
    chainId: ChainEntity['id'];
  }
>('wallet/askForNetworkChange', async ({ chainId }) => {
  const walletConnection = await getWalletConnectionApi();
  await walletConnection.askUserForChainChange(chainId);
});
