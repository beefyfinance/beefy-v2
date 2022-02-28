import { Action } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchAllPricesAction } from '../actions/prices';
import { fetchAllVaults } from '../actions/vaults';
import { selectAllChains } from '../selectors/chains';
import mockPrices from './mock-prices.json';
import mockLPPrices from './mock-lp-prices.json';
import { rootReducer } from '../reducers';

/**
 * Create a new BeefyState store with some data included
 * This is used in tests to get a decent starting state
 * when doing things like TVL or APY computation
 * TODO: maybe memoize that, we have to deep freeze the output for that
 */
export async function getBeefyTestingStore() {
  // here, the store has all the proper TS typings
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        // because we use BigNumber which is not serializable by default
        // we disable rerialization altogether
        // a better solution would be to allow serialization of the store
        serializableCheck: false,

        // this makes the old code bug
        immutableCheck: false,
      }),
  });

  let state = store.getState();

  // trigger all configs actions
  await store.dispatch(fetchChainConfigs());
  state = store.getState();
  const chains = selectAllChains(state);
  await store.dispatch(fetchAllVaults({}));
  await store.dispatch(fetchAllBoosts());

  // mock token prices
  store.dispatch({
    type: fetchAllPricesAction.fulfilled,
    payload: { ...mockPrices, ...mockLPPrices },
  });

  return store;
}
