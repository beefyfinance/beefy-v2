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

const ensCache: Record<string, string> = {};
export const getEns = createAsyncThunk<string, { address: string | null }, { state: BeefyState }>(
  'wallet/getEns',
  async ({ address }, { getState }) => {
    if (!address) {
      return '';
    }

    const addressLower = address.toLowerCase();
    if (addressLower in ensCache) {
      return ensCache[addressLower];
    }

    const bscChain = selectChainById(getState(), 'bsc');
    const ethChain = selectChainById(getState(), 'ethereum');
    const results = await Promise.allSettled([
      getEnsAddress(address, ethChain),
      getSpaceIdAddress(address, bscChain),
    ]);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        ensCache[addressLower] = result.value;
        return result.value;
      }
    }

    ensCache[addressLower] = '';
    return '';
  }
);

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
