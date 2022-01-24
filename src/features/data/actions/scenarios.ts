import { Action } from 'redux';
import { store } from '../../../store';
import { ChainEntity } from '../entities/chain';
import { selectAllChains } from '../selectors/chains';
import { createFulfilledActionCapturer, poll, PollStop } from '../utils/async-utils';
import { fetchApyAction } from './apy';
import { fetchBoostContractDataAction } from './boost-contract';
import { fetchBoostsByChainIdAction } from './boosts';
import { fetchChainConfigs } from './chains';
import { fetchLPPricesAction, fetchPricesAction } from './prices';
import {
  fetchGovVaultContractDataAction,
  fetchStandardVaultContractDataAction,
} from './vault-contract';
import { fetchVaultByChainIdAction } from './vaults';

/**
 * This is just for reference and help developing the fetch methods
 */
const actionTypeDependencies: { [actionType: string]: string[] } = {
  // config actions don't have any dependencies
  [fetchChainConfigs.typePrefix]: [],
  [fetchVaultByChainIdAction.typePrefix]: [fetchChainConfigs.typePrefix],
  [fetchBoostsByChainIdAction.typePrefix]: [fetchChainConfigs.typePrefix],

  // fetching prices from beefy api don't have dependencies
  [fetchPricesAction.typePrefix]: [],
  [fetchLPPricesAction.typePrefix]: [],
  [fetchApyAction.typePrefix]: [],

  // if we want to process contract data we need chains, prices, and vault data
  [fetchStandardVaultContractDataAction.typePrefix]: [
    fetchVaultByChainIdAction.typePrefix,
    fetchBoostsByChainIdAction.typePrefix,
    fetchPricesAction.typePrefix,
    fetchLPPricesAction.typePrefix,
  ],

  // for gov vaults it's the same as standard vaults, but we need to handle exclusions so we also need standard vaults
  [fetchGovVaultContractDataAction.typePrefix]: [fetchStandardVaultContractDataAction.typePrefix],

  // for boost contracts, we need all vaults contract data to be loaded
  [fetchBoostContractDataAction.typePrefix]: [
    fetchStandardVaultContractDataAction.typePrefix,
    fetchGovVaultContractDataAction.typePrefix,
  ],
};

/**
 * Challenge:
 *  We want to start fetching data as soon as possible
 *  But some reducers depends on some previous state to have been fetched, like the TVL depends on token prices to be in the store
 *  Async thunks by redux toolkit don't allow us to delay the fulfilled dispatch until needed
 *
 * Solutions:
 *
 * 👀 Middleware: have a middleware that delay dispatches until all call dependencies have been met
 *  - could be weird when debugging
 *  - have to be smart about action parameters (chain params), etc
 *  - could be a mess to debug -> have some test
 *  - people will forget about it and make annoying mistakes?
 *  - the dependency tree encodes reducer dependencies, which is completely separate code
 *
 * 👀 Custom Scenario: Have a scenario that call the payloadCreator function and dispatch only when needed
 *  - easy to understand, complexity will be in a single place (the scenario)
 *  - keep the state reducers simple, but keep implicit dependencies between reducers
 *  - have to separate payloadCreator function from the async action (that's ok)
 *  - will be hard to use async thunk actions without dispatching them
 *     - maybe pass a custom store and re-dispatch this store actions?
 *
 * 👀 Make reducers smarter:
 *  - each reducer handles data when it can
 *  - we may need to hack a new action to trigger computations
 *  - will make reducers more complex many will have to handle partial data
 *     - having to handle partial data looks "ok" from a dev perspective
 *  - we could encode dependencies directly in the reducer: in tvl, we say we depend on this and this action to be fulfilled and dispatched
 *  - we could "wrap" a reducer in some generic sauce that put "actions to be processed" in the state
 *  - but we will have to wait for 1 dispatch cycle to be able to use selectors like normal
 *  - this would be the "proper" way
 */

/**
 * Fetch all necessary information for the home page
 * TODO: we need to inject the store in parameters somehow and not get if from a global import
 */
export async function initHomeDataV2() {
  const captureFulfilledAction = createFulfilledActionCapturer(store);

  // start fetching chain config
  store.dispatch(fetchChainConfigs());

  // we can start fetching prices right now and await them later
  const pricesPromise = Promise.all([
    store.dispatch(fetchPricesAction({})),
    store.dispatch(fetchLPPricesAction({})),
  ]);

  // we can start fetching apy, it will arrive when it wants, nothing depends on it
  store.dispatch(fetchApyAction({}));

  // then, we work by chain
  // todo: put this in a config
  const chains = [
    'arbitrum',
    'avax',
    'bsc',
    'celo',
    'cronos',
    'fantom',
    'fuse',
    'harmony',
    'heco',
    'metis',
    'moonriver',
    'polygon',
  ].map(id => ({ id }));

  // we fetch the configuration for each chain
  const vaultBoostPromisesByChain: { [chainId: ChainEntity['id']]: Promise<any> } = {};
  for (const chain of chains) {
    vaultBoostPromisesByChain[chain.id] = Promise.all([
      store.dispatch(fetchVaultByChainIdAction({ chainId: chain.id })),
      store.dispatch(fetchBoostsByChainIdAction({ chainId: chain.id })),
    ]);
  }

  // now we start fetching all data for all chains
  const rpcFulfilledCapturesByChain: {
    [cahinId: ChainEntity['id']]: {
      standardVaultContracts: Promise<() => Action>;
      govVaultContracts: Promise<() => Action>;
      boostContracts: Promise<() => Action>;
    };
  } = {};
  for (const chain of chains) {
    (async () => {
      // we need config data with contract addresses to start querying the rest
      await vaultBoostPromisesByChain[chain.id];

      // begin fetching all contract-related data at the same time
      rpcFulfilledCapturesByChain[chain.id] = {
        standardVaultContracts: captureFulfilledAction(
          fetchStandardVaultContractDataAction({ chainId: chain.id })
        ),
        govVaultContracts: captureFulfilledAction(
          fetchGovVaultContractDataAction({ chainId: chain.id })
        ),
        boostContracts: captureFulfilledAction(fetchBoostContractDataAction({ chainId: chain.id })),
      };
    })();
  }

  // ok now we started all calls, it's just a matter of ordering fulfill actions

  // before doing anything else, we need our prices
  await pricesPromise;

  for (const chain of chains) {
    (async () => {
      // dispatch fulfills in order
      await store.dispatch((await rpcFulfilledCapturesByChain[chain.id].standardVaultContracts)());
      await store.dispatch((await rpcFulfilledCapturesByChain[chain.id].govVaultContracts)());
      await store.dispatch((await rpcFulfilledCapturesByChain[chain.id].boostContracts)());
    })();
  }
}

let pollStopFns: PollStop[] = [];

/**
 * Fetch all necessary information for the home page
 * TODO: this could still be improved as we don't have to dispatch action results right await. We could fetch some data and dispatch it when all relevant dispatch have been done
 * TODO: we need to inject the store in parameters somehow and not get if from a global import
 */
export async function initHomeDataV1() {
  // start fetching chain config
  const chainsConfigPromise = store.dispatch(fetchChainConfigs());

  // we can start fetching prices right now and await them later
  const pricesPromise = Promise.all([
    store.dispatch(fetchPricesAction({})),
    store.dispatch(fetchLPPricesAction({})),
  ]);

  // we can start fetching apy, it will arrive when it wants, nothing depends on it
  store.dispatch(fetchApyAction({}));

  // first, we need our chains
  await chainsConfigPromise;

  // then, we work by chain
  const state = store.getState();
  const chains = selectAllChains(state);
  //const chains = [{ id: 'arbitrum' }]; // ok
  //const chains = [{ id: 'avax' }]; // ok
  //const chains = [{ id: 'bsc' }]; // ok
  //const chains = [{ id: 'celo' }]; // ok
  //const chains = [{ id: 'cronos' }]; // ok
  //const chains = [{ id: 'fantom' }]; // ok
  //const chains = [{ id: 'fuse' }]; // ok
  //const chains = [{ id: 'harmony' }]; // ok
  //const chains = [{ id: 'heco' }]; // ok
  //const chains = [{ id: 'metis' }]; // ok
  //const chains = [{ id: 'moonriver' }]; // ok
  //const chains = [{ id: 'polygon' }]; // ok

  const vaultBoostPromisesByChain: { [chainId: ChainEntity['id']]: Promise<any> } = {};
  for (const chain of chains) {
    // we need all data for a chain to work
    vaultBoostPromisesByChain[chain.id] = Promise.all([
      store.dispatch(fetchVaultByChainIdAction({ chainId: chain.id })),
      store.dispatch(fetchBoostsByChainIdAction({ chainId: chain.id })),
    ]);
  }

  // before doing anything else, we need our prices
  await pricesPromise;

  // now fetch contract data
  for (const chain of chains) {
    // make it so we don't wait for one chain to finish to fetch another chain
    (async () => {
      // we need all this data for a chain to work
      await vaultBoostPromisesByChain[chain.id];

      // we need to load standard vault data first
      await store.dispatch(fetchStandardVaultContractDataAction({ chainId: chain.id }));
      // then we can fetch gov vault data
      await store.dispatch(fetchGovVaultContractDataAction({ chainId: chain.id }));
      // finally we can fetch boost data
      await store.dispatch(fetchBoostContractDataAction({ chainId: chain.id }));
    })();
  }

  // disable for now, debugging stuff
  return;

  // cancel regular polls if we already have some
  for (const stop of pollStopFns) {
    stop();
  }
  pollStopFns = [];

  // now set regular calls to update prices
  pollStopFns.push(
    poll(async () => {
      return Promise.all([
        store.dispatch(fetchPricesAction({})),
        store.dispatch(fetchLPPricesAction({})),
        store.dispatch(fetchApyAction({})),
      ]);
    }, 45 * 1000)
  );

  // now set regular calls to update contract data
  for (const chain of chains) {
    pollStopFns.push(
      poll(async () => {
        // we need to load standard vault data first
        await store.dispatch(fetchStandardVaultContractDataAction({ chainId: chain.id }));
        // then we can fetch gov vault data
        await store.dispatch(fetchGovVaultContractDataAction({ chainId: chain.id }));
        // finally we can fetch boost data
        await store.dispatch(fetchBoostContractDataAction({ chainId: chain.id }));
      }, 60 * 1000)
    );
  }
}
