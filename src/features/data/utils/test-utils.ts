import { configureStore } from '@reduxjs/toolkit';
import { fetchBoostsByChainIdAction } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchPricesAction } from '../actions/prices';
import { fetchVaultByChainIdAction } from '../actions/vaults';
import { selectAllChains } from '../selectors/chains';
import { BeefyState, dataReducer } from '../state';
import mockPrices from './mock-prices.json';
import mockLPPrices from './mock-lp-prices.json';

let _initialTestStateCache: BeefyState | null = null;
/**
 * Create a new BeefyState with some data included
 * This is used in tests to get a decent starting state
 * when doing things like TVL or APY computation
 * TODO: maybe memoize that, we have to deep freeze the output for that
 */
export async function getBeefyTestingInitialState(): Promise<BeefyState> {
  if (_initialTestStateCache !== null) {
    return _initialTestStateCache;
  }

  // here, the store has all the proper TS typings
  const store = configureStore({
    reducer: dataReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        // because we use BigNumber which is not serializable by default
        // we disable rerialization altogether
        // a better solution would be to allow serialization of the store
        serializableCheck: false,
      }),
  });

  let state = store.getState();

  // trigger all configs actions
  await store.dispatch(fetchChainConfigs());
  state = store.getState();
  const chains = selectAllChains(state);
  for (const chain of chains) {
    await store.dispatch(fetchVaultByChainIdAction({ chainId: chain.id }));
    await store.dispatch(fetchBoostsByChainIdAction({ chainId: chain.id }));
  }

  // mock token prices
  await store.dispatch({ type: fetchPricesAction.fulfilled, payload: mockPrices });
  await store.dispatch({ type: fetchPricesAction.fulfilled, payload: mockLPPrices });

  state = store.getState();

  // freeze the state to make sure we always return the
  // same initial state even in the presence of buggy code
  // that modifies our cached state
  Object.freeze(state);
  _initialTestStateCache = state;
  return _initialTestStateCache;
}
