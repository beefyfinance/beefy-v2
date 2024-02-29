// when some wallet actions are triggered (like connection or account changed)

import type { BeefyStore } from '../../../redux-types';
import type { CapturedFulfilledActions } from '../actions/scenarios';
import { chains, dispatchUserFfs, fetchCaptureUserData } from '../actions/scenarios';
import type { ChainEntity } from '../entities/chain';
import { selectHasWalletBalanceBeenFetched } from '../selectors/balance';
import { fetchWalletTimeline } from '../actions/analytics';

async function reloadUserData(store: BeefyStore, walletAddress: string) {
  const userFfsByChain: { [chainId in ChainEntity['id']]?: CapturedFulfilledActions['user'] } = {};
  for (const chain of chains) {
    userFfsByChain[chain.id] = fetchCaptureUserData(store, chain.id, walletAddress);
  }
  for (const chain of chains) {
    const userFfs = userFfsByChain[chain.id];
    if (!userFfs) continue;
    dispatchUserFfs(store, userFfs);
  }

  store.dispatch(fetchWalletTimeline({ walletAddress }));
}

// fetch balance and allowance again
export function walletActionsMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: { chainId?: ChainEntity['id'] } }) => {
    const walletAddressBefore = store.getState().user.wallet.address;
    await next(action);
    const walletAddressAfter = store.getState().user.wallet.address;

    // On rehydrate, avoid refetching since it will be triggered from scenario already
    if (action.type === 'persist/REHYDRATE') return;

    if (walletAddressBefore !== walletAddressAfter && walletAddressAfter) {
      // reload data if account has changed and we don't already have some data
      // ie: when user selects a totally new account, we want to fetch
      // his wallet balance and allowances
      if (!selectHasWalletBalanceBeenFetched(store.getState(), walletAddressAfter)) {
        setTimeout(() => reloadUserData(store, walletAddressAfter), 50);
      }
    }
  };
}
