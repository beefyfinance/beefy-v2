import { isAnyOf } from '@reduxjs/toolkit';
import { fetchAllBalanceAction } from '../actions/balance.ts';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet.ts';
import { selectAllChainIds } from '../selectors/chains.ts';
import { selectWalletAddress } from '../selectors/wallet.ts';
import { startAppListening } from './listener-middleware.ts';

const hasWalletChanged = isAnyOf(
  userDidConnect,
  accountHasChanged,
  walletHasDisconnected,
  chainHasChanged,
  chainHasChangedToUnsupported
);

export function addWalletListeners() {
  /**
   * When connected wallet address changes, fetch data for the new wallet address
   */
  startAppListening({
    matcher: hasWalletChanged,
    effect: async (
      _action,
      { dispatch, delay, cancelActiveListeners, getState, getOriginalState }
    ) => {
      const state = getState();
      const walletAddress = selectWalletAddress(state);
      const hasWalletChanged = walletAddress !== selectWalletAddress(getOriginalState());
      if (hasWalletChanged) {
        // Debounce
        cancelActiveListeners();
        await delay(50);
        // Fetch new user data if we have a new wallet address
        if (walletAddress) {
          const chains = selectAllChainIds(state);
          for (const chainId of chains) {
            dispatch(fetchAllBalanceAction({ chainId, walletAddress }));
          }
        }
      }
    },
  });
}
