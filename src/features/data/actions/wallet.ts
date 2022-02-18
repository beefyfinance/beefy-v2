import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyStore } from '../../../redux-types';
import { getWalletConnectApiInstance } from '../apis/instances';
import { IWalletConnectApi } from '../apis/wallet/wallet-connect-types';
import { ChainEntity } from '../entities/chain';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  initWalletState,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet';
import { selectAllChains } from '../selectors/chains';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags';

let walletCo: IWalletConnectApi | null = null;

export async function initWallet(store: BeefyStore) {
  const state = store.getState();
  const chains = selectAllChains(state);
  // instanciate and do the proper piping between both worlds
  walletCo = await getWalletConnectApiInstance({
    chains,
    onConnect: (chainId, address) =>
      store.dispatch(
        userDidConnect({ chainId, address: featureFlag_walletAddressOverride(address) })
      ),
    onAccountChanged: address =>
      store.dispatch(accountHasChanged({ address: featureFlag_walletAddressOverride(address) })),
    onChainChanged: (chainId, address) =>
      store.dispatch(
        chainHasChanged({ chainId, address: featureFlag_walletAddressOverride(address) })
      ),
    onUnsupportedChainSelected: (networkChainId, address) =>
      store.dispatch(
        chainHasChangedToUnsupported({
          networkChainId,
          address: featureFlag_walletAddressOverride(address),
        })
      ),
    onWalletDisconnected: () => store.dispatch(walletHasDisconnected()),
  });

  // synchronize wallet instance with the redux state
  // the wallet instance has a cache on it's own
  const initRes = await walletCo.initFromLocalCache();
  store.dispatch(initWalletState(initRes));
}

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
