import type { BeefyState } from '../../../redux-types';
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet/wallet';
import { selectWalletAddress } from '../selectors/wallet';
import { selectAllChainIds } from '../selectors/chains';
import { fetchAllBalanceAction } from '../actions/balance';

const hasWalletChanged = isAnyOf(
  userDidConnect,
  accountHasChanged,
  walletHasDisconnected,
  chainHasChanged,
  chainHasChangedToUnsupported
);

const walletListener = createListenerMiddleware<BeefyState>();

/**
 * When connected wallet address changes, fetch data for the new wallet address
 */
walletListener.startListening({
  matcher: hasWalletChanged,
  effect: async (
    action,
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

export const walletMiddleware = walletListener.middleware;
