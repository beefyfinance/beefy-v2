import { store } from '../../../store';
import { ChainEntity } from '../entities/chain';
import { selectAllChains } from '../selectors/chains';
import { poll, PollStop } from '../utils/async-utils';
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

let pollStopFns: PollStop[] = [];

/**
 * Fetch all necessary information for the home page
 * TODO: this could still be improved as we don't need to wait for some calls to end before starting new calls we could start calls asap and handle the result only when we have all the data
 * TODO: we need to inject the store in parameters somehow
 * TODO: handle errors
 */
export async function initHomeData() {
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
  //const chains = selectAllChains(state);
  const chains = [{ id: 'cronos' }];

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
    // make is so we don't wait for one chain to finoish to fetch another chain
    (async () => {
      // we need all data for a chain to work
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
  //return;

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
