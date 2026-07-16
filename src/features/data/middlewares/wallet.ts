import { isAnyOf } from '@reduxjs/toolkit';
import { fetchAllBalanceAction } from '../actions/balance.ts';
import { transactClearInput } from '../actions/transact.ts';
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
  // last non-null address; survives the disconnected gap so A -> undefined -> B counts as a change
  let lastWalletAddress: string | undefined = undefined;

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
      const previousAddress = selectWalletAddress(getOriginalState());
      const hasWalletChanged = walletAddress !== previousAddress;
      if (hasWalletChanged) {
        const formAddress = previousAddress ?? lastWalletAddress;
        lastWalletAddress = walletAddress ?? previousAddress;
        if (walletAddress && formAddress && walletAddress !== formAddress) {
          // switched to a different account: form inputs/quotes were built for the old one
          dispatch(transactClearInput());
        }

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
