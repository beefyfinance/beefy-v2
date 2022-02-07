import { Action } from 'redux';
import { ChainEntity } from '../entities/chain';
import { selectIsWalletConnected } from '../selectors/wallet';
import { createFulfilledActionCapturer, poll, PollStop } from '../utils/async-utils';
import { fetchApyAction } from './apy';
import { fetchAllBoosts } from './boosts';
import { fetchChainConfigs } from './chains';
import { fetchAllPricesAction, fetchBeefyBuybackAction } from './prices';
import { fetchAllVaults, fetchFeaturedVaults } from './vaults';
import { fetchAllBalanceAction } from './balance';
import { fetchAllContractDataByChainAction } from './contract-data';
import { featureFlag_dataPolling } from '../utils/feature-flags';
//import { fetchAllAllowanceAction } from './allowance';
import { BeefyStore } from '../../../redux-types';
import { chains as chainsConfig } from '../../../config/config';
import { initWallet } from './wallet';
import { recomputeBoostStatus } from '../reducers/boosts';

type CapturedFulfilledActionGetter = Promise<() => Action>;
export interface CapturedFulfilledActions {
  contractData: CapturedFulfilledActionGetter;
  user: {
    balance: CapturedFulfilledActionGetter;
    //allowance: CapturedFulfilledActionGetter;
  } | null;
}

let pollStopFns: PollStop[] = [];

export const chains = chainsConfig.map(id => ({ id }));

/**
 * Fetch all necessary information for the home page
 */
export async function initHomeDataV4(store: BeefyStore) {
  const captureFulfill = createFulfilledActionCapturer(store);

  // start fetching chain config
  const chainListPromise = store.dispatch(fetchChainConfigs());

  // we fetch the configuration for all chain
  const boostListPromise = store.dispatch(fetchAllBoosts());
  const vaultListFulfill = captureFulfill(fetchAllVaults({}));

  // we can start fetching prices right now and await them later
  const pricesPromise = store.dispatch(fetchAllPricesAction({}));

  // create the wallet instance as soon as we get the chain list
  setTimeout(async () => {
    // we can start fetching apy, it will arrive when it wants, nothing depends on it
    store.dispatch(fetchApyAction({}));

    // we start fetching buyback
    store.dispatch(fetchBeefyBuybackAction({}));

    store.dispatch(fetchFeaturedVaults());
  });

  // create the wallet instance as soon as we get the chain list
  setTimeout(async () => {
    await chainListPromise;
    initWallet(store);
  });

  // we need config data (for contract addresses) to start querying the rest
  await chainListPromise;
  // we need the chain list to handle the vault list
  store.dispatch((await vaultListFulfill)());
  await boostListPromise;

  // then, we work by chain

  // now we start fetching all data for all chains
  const fulfillsByNet: {
    [chainId: ChainEntity['id']]: CapturedFulfilledActions;
  } = {};
  for (const chain of chains) {
    fulfillsByNet[chain.id] = {
      contractData: captureFulfill(fetchAllContractDataByChainAction({ chainId: chain.id })),
      user: null,
    };
    if (selectIsWalletConnected(store.getState())) {
      fulfillsByNet[chain.id].user = fetchCaptureUserData(store, chain.id);
    }
  }

  // ok now we started all calls, it's just a matter of ordering fulfill actions

  // before doing anything else, we need our prices
  await pricesPromise;

  for (const chain of chains) {
    // run in an async block se we don't wait for a slow chain
    (async () => {
      const chainFfs = fulfillsByNet[chain.id];
      await store.dispatch((await chainFfs.contractData)());
      if (chainFfs.user !== null) {
        dispatchUserFfs(store, chainFfs.user);
      }
    })().catch(err => {
      // as we still dispatch network errors, for reducers to handle
      // there is not much to do here, this is just to avoid
      // "unhandled promise exception" messages in the console
      console.warn(err);
    });
  }

  // ok all data is fetched, now we start the poll functions

  if (!featureFlag_dataPolling()) {
    console.debug('Polling disabled');
    return;
  }

  // cancel regular polls if we already have some
  for (const stop of pollStopFns) {
    stop();
  }
  pollStopFns = [];

  // recompute boost activity status
  let pollStop = poll(async () => {
    return store.dispatch(recomputeBoostStatus());
  }, 5 * 1000 /* every 5s */);
  pollStopFns.push(pollStop);

  // now set regular calls to update prices
  pollStop = poll(async () => {
    return Promise.all([
      store.dispatch(fetchAllPricesAction({})),
      store.dispatch(fetchApyAction({})),
    ]);
  }, 45 * 1000 /* every 45s */);
  pollStopFns.push(pollStop);

  // now set regular calls to update contract data
  for (const chain of chains) {
    const pollStop = poll(async () => {
      // trigger all calls at the same time
      const fulfills: Omit<CapturedFulfilledActions, 'user'> = {
        contractData: captureFulfill(fetchAllContractDataByChainAction({ chainId: chain.id })),
      };

      // dispatch fulfills in order
      await store.dispatch((await fulfills.contractData)());
    }, 60 * 1000 /* every 60s */);
    pollStopFns.push(pollStop);
  }

  // now set regular calls to update user data
  for (const chain of chains) {
    const pollStop = poll(async () => {
      // trigger all calls at the same time
      const fulfills = fetchCaptureUserData(store, chain.id);

      // dispatch fulfills in order
      await dispatchUserFfs(store, fulfills);
    }, 60 * 1000 /* every 60s */);
    pollStopFns.push(pollStop);
  }
}

export function fetchCaptureUserData(
  store: BeefyStore,
  chainId: ChainEntity['id']
): CapturedFulfilledActions['user'] {
  const captureFulfill = createFulfilledActionCapturer(store);
  return {
    balance: captureFulfill(fetchAllBalanceAction({ chainId })),
    // TODO: do we really need to fetch allowances right now?
    //allowance: captureFulfill(fetchAllAllowanceAction({ chainId })),
  };
}

export async function dispatchUserFfs(
  store: BeefyStore,
  userFfs: CapturedFulfilledActions['user']
) {
  await store.dispatch((await userFfs.balance)());
  //await store.dispatch((await userFfs.allowance)());
}
