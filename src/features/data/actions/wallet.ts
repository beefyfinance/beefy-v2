import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getWalletConnectApiInstance } from '../apis/instances';
import { initFromLocalCacheResponse, IWalletConnectApi } from '../apis/wallet/wallet-connect-types';
import { ChainEntity } from '../entities/chain';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet';
import { selectAllChains } from '../selectors/chains';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags';

let walletCo: IWalletConnectApi | null = null;

export const initWallet = createAsyncThunk<initFromLocalCacheResponse, void, { state: BeefyState }>(
  'wallet/initWallet',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const chains = selectAllChains(state);

    // instantiate and do the proper piping between both worlds
    walletCo = await getWalletConnectApiInstance({
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

    // synchronize wallet instance with the redux state
    // the wallet instance has a cache on it's own
    return await walletCo.initFromLocalCache();
  }
);

export const askForWalletConnection = createAsyncThunk(
  'wallet/askForWalletConnection',
  async () => {
    if (!walletCo) {
      throw new Error("Wallet instance isn't initialized");
    }
    await walletCo.askUserToConnectIfNeeded();
  }
);

export const doDisconnectWallet = createAsyncThunk('wallet/doDisconnectWallet', async () => {
  if (!walletCo) {
    throw new Error("Wallet instance isn't initialized");
  }
  await walletCo.disconnect();
});

export const askForNetworkChange = createAsyncThunk<void, { chainId: ChainEntity['id'] }>(
  'wallet/askForNetworkChange',
  async ({ chainId }) => {
    if (!walletCo) {
      throw new Error("Wallet instance isn't initialized");
    }
    await walletCo.askUserForChainChangeIfNeeded(chainId);
  }
);
