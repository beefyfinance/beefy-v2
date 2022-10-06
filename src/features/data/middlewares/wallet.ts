// when some wallet actions are triggered (like connection or account changed)

import { BeefyStore } from '../../../redux-types';
import {
  CapturedFulfilledActions,
  chains,
  dispatchUserFfs,
  fetchCaptureUserData,
} from '../actions/scenarios';
import { ChainEntity } from '../entities/chain';
import { selectHasWalletBalanceBeenFetched } from '../selectors/balance';

async function reloadUserData(store: BeefyStore) {
  const userFfsByChain: { [chainId: ChainEntity['id']]: CapturedFulfilledActions['user'] } = {};
  for (const chain of chains) {
    userFfsByChain[chain.id] = fetchCaptureUserData(store, chain.id);
  }
  for (const chain of chains) {
    dispatchUserFfs(store, userFfsByChain[chain.id]);
  }
}

// fetch balance and allowance again
export function walletActionsMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: { chainId?: ChainEntity['id'] } }) => {
    const walletAddressBefore = store.getState().user.wallet.address;
    await next(action);
    const walletAddressAfter = store.getState().user.wallet.address;

    // On rehydrate, avoid refetching since it will be triggered from scenario already
    if (action.type === 'persist/REHYDRATE') return;

    if (walletAddressBefore !== walletAddressAfter && walletAddressAfter !== null) {
      // reload data if account has changed and we don't already have some data
      // ie: when user selects a totally new account, we want to fetch
      // his wallet balance and allowances
      if (!selectHasWalletBalanceBeenFetched(store.getState(), walletAddressAfter)) {
        setTimeout(() => reloadUserData(store), 50);
      }
    }
  };
}
