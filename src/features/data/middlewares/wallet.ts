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

    switch (action.type) {
      case userDidConnect.type:
      case accountHasChanged.type:
        setTimeout(() => reloadUserData(store), 50);
        break;
    }
  };
}
