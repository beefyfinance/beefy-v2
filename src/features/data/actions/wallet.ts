import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getWalletConnectionApiInstance } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet';
import { selectAllChains, selectChainById } from '../selectors/chains';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags';
import { selectIsWalletConnected } from '../selectors/wallet';
import { getEnsAddress, getSpaceIdAddress } from '../../../helpers/addresses';

export const getEns = createAsyncThunk<
  { ens: string },
  { address: string | null },
  { state: BeefyState }
>('wallet/getEns', async ({ address }, { getState }) => {
  const bscChain = selectChainById(getState(), 'bsc');
  const ensName = await getEnsAddress(address);
  if (ensName) return { ens: ensName };
  const sidName = await getSpaceIdAddress(address, bscChain);
  return { ens: sidName?.name ?? '' };
});

export const initWallet = createAsyncThunk<void, void, { state: BeefyState }>(
  'wallet/initWallet',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const chains = selectAllChains(state);

    // instantiate and do the proper piping between both worlds
    await getWalletConnectionApiInstance({
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
      onWalletDisconnected: () => dispatch(walletHasDisconnected()),
    });

    // MM is not loaded on browser restart and fails until page refresh
    // So we wait a small amount of time
    setTimeout(async () => {
      dispatch(tryToAutoReconnect());
    }, 500);
  }
);

export const tryToAutoReconnect = createAsyncThunk<void, void, { state: BeefyState }>(
  'wallet/tryToAutoReconnect',
  async (_, { getState }) => {
    const state = getState();
    if (!selectIsWalletConnected(state)) {
      const walletConnection = await getWalletConnectionApiInstance();
      await walletConnection.tryToAutoReconnect();
    }
  }
);

export const askForWalletConnection = createAsyncThunk(
  'wallet/askForWalletConnection',
  async () => {
    try {
      const walletConnection = await getWalletConnectionApiInstance();
      await walletConnection.askUserToConnectIfNeeded();
    } catch (err) {
      console.error('askForWalletConnection', err);
      throw err;
    }
  }
);

export const doDisconnectWallet = createAsyncThunk('wallet/doDisconnectWallet', async () => {
  const walletConnection = await getWalletConnectionApiInstance();
  await walletConnection.disconnect();
});

export const askForNetworkChange = createAsyncThunk<void, { chainId: ChainEntity['id'] }>(
  'wallet/askForNetworkChange',
  async ({ chainId }) => {
    const walletConnection = await getWalletConnectionApiInstance();
    await walletConnection.askUserForChainChange(chainId);
  }
);
