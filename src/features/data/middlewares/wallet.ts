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

// fetch balance and allowance again
export function walletActionsMiddleware(store: BeefyStore) {
  return next => async (action: { type: string; payload: { chainId?: ChainEntity['id'] } }) => {
    await next(action);

    let userFfsByChain: { [chainId: ChainEntity['id']]: CapturedFulfilledActions['user'] } | null =
      null;
    switch (action.type) {
      case userDidConnect.type:
      case accountHasChanged.type:
        userFfsByChain = {};
        for (const chain of chains) {
          userFfsByChain[chain.id] = fetchCaptureUserData(store, chain.id);
        }
        break;
    }

    if (userFfsByChain !== null) {
      for (const chain of chains) {
        dispatchUserFfs(store, userFfsByChain[chain.id]);
      }
    }
  };
}
