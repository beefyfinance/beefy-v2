// when some wallet actions are triggered (like connection or account changed)

import { BeefyStore } from '../../../redux-types';
import {
  CapturedFulfilledActions,
  chains,
  dispatchUserFfs,
  fetchCaptureUserData,
} from '../actions/scenarios';
import { ChainEntity } from '../entities/chain';
import { accountHasChanged, userDidConnect } from '../reducers/wallet';
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
    await next(action);

    if (action.type === userDidConnect.type || action.type === accountHasChanged.type) {
      // @ts-ignore
      const address: string = action.payload.address;
      // reload data if account has changed and we don't already have some data
      // ie: when user selects a totally new account, we want to fetch
      // his wallet balance and allowances
      if (!selectHasWalletBalanceBeenFetched(store.getState(), address)) {
        setTimeout(() => reloadUserData(store), 50);
      }
    }
  };
}
