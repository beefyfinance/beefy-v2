import { store } from '../../../store';
import { ChainEntity } from '../entities/chain';
import { selectAllChains } from '../selectors/chains';
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
 * Fetch all necessary information for the home page
 * TODO: this could still be improved as we don't need to wait for some calls to end before starting new calls we could start calls asap and handle the result only when we have all the data
 * TODO: we need to inject the store in parameters somehow
 * TODO: handle errors
 */
export async function initHomeData() {
  const chainsConfigPromise = store.dispatch(fetchChainConfigs());

  // we can start fetching prices right now and await them later
  const pricesPromise = Promise.all([
    store.dispatch(fetchPricesAction({})),
    store.dispatch(fetchLPPricesAction({})),
    store.dispatch(fetchApyAction({})),
  ]);

  // first, we need our chains
  await chainsConfigPromise;

  // then, we work by chain
  const state = store.getState();
  const chains = selectAllChains(state);

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

      // now we can fetch contract data
      await Promise.all([
        store.dispatch(fetchBoostContractDataAction({ chainId: chain.id })),
        store.dispatch(fetchGovVaultContractDataAction({ chainId: chain.id })),
        store.dispatch(fetchStandardVaultContractDataAction({ chainId: chain.id })),
      ]);
    })();
  }
}
