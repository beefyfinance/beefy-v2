import type { BeefyState } from '../../../redux-types';
import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import { fetchChainConfigs } from '../actions/chains';
import { selectActiveRpcUrlForChain, selectAllChains } from '../selectors/chains';
import { rpcClientManager } from '../apis/rpc-contract/rpc-manager';

const chainsListener = createListenerMiddleware<BeefyState>();

chainsListener.startListening({
  matcher: isFulfilled(fetchChainConfigs),
  effect: async (action, { getState, cancelActiveListeners, unsubscribe }) => {
    cancelActiveListeners();
    unsubscribe();

    console.log('Initializing viem clients');
    const state = getState();
    selectAllChains(state).forEach(chain => {
      console.log(`Initializing viem clients for chain ${chain.id} `, chain);
      rpcClientManager.setClients(chain, selectActiveRpcUrlForChain(state, chain.id));
    });
  },
});

export const chainMiddleware = chainsListener.middleware;
