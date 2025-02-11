import type { BeefyState } from '../../../redux-types';
import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import { fetchChainConfigs } from '../actions/chains';
import { selectActiveRpcUrlForChain, selectAllChains } from '../selectors/chains';
import { rpcClientManager } from '../apis/rpc-contract/rpc-manager';

const chainsListener = createListenerMiddleware<BeefyState>();

chainsListener.startListening({
  matcher: isFulfilled(fetchChainConfigs),
  effect: async (action, { getState, cancelActiveListeners, unsubscribe, condition }) => {
    const start = Date.now();
    await condition((_, state) => selectAllChains(state).length > 0);
    console.log('Initializing viem clients. Took', Date.now() - start, 'ms');
    const state = getState();
    const chains = selectAllChains(state);
    console.log('Chains ', chains);
    chains.forEach(chain => {
      console.log(`Initializing viem clients for chain ${chain.id} `, chain);
      rpcClientManager.setClients(chain, selectActiveRpcUrlForChain(state, chain.id));
    });
    cancelActiveListeners();
    unsubscribe();
  },
});

export const chainMiddleware = chainsListener.middleware;
