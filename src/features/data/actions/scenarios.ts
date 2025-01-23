import type { Action } from 'redux';
import type { ChainEntity } from '../entities/chain';
import { selectIsWalletKnown, selectWalletAddress } from '../selectors/wallet';
import type { PollStop } from '../utils/async-utils';
import { createFulfilledActionCapturer, poll } from '../utils/async-utils';
import { fetchApyAction } from './apy';
import { fetchAllBoosts } from './boosts';
import { fetchChainConfigs } from './chains';
import { fetchAllPricesAction } from './prices';
import { fetchAllVaults, fetchVaultsLastHarvests, fetchVaultsPinnedConfig } from './vaults';
import { fetchAllBalanceAction } from './balance';
import { fetchAllContractDataByChainAction } from './contract-data';
import { featureFlag_noDataPolling } from '../utils/feature-flags';
import type { BeefyStore, BeefyThunk } from '../../../redux-types';
import { chains as chainsConfig } from '../../../config/config';
import { initWallet } from './wallet';
import { recomputeBoostStatus } from '../reducers/boosts';
import { fetchPartnersConfig } from './partners';
import { fetchAllAddressBookAction } from './tokens';
import { fetchPlatforms } from './platforms';
import { selectAllChainIds } from '../selectors/chains';
import { fetchBridges } from './bridges';
import {
  fetchZapSwapAggregatorsAction,
  fetchZapConfigsAction,
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
} from './zap';
import { fetchOffChainCampaignsAction } from './rewards';

type CapturedFulfilledActionGetter = Promise<() => Action>;

export interface CapturedFulfilledActions {
  contractData: CapturedFulfilledActionGetter;
  user:
    | {
        balance: CapturedFulfilledActionGetter;
        //allowance: CapturedFulfilledActionGetter;
      }
    | undefined;
}

let pollStopFns: PollStop[] = [];

export const chains = chainsConfig.map(id => ({ id }));

/**
 * Fetch all necessary information for the home page
 */
export async function initAppData(store: BeefyStore) {
  const captureFulfill = createFulfilledActionCapturer(store);

  // start fetching chain config
  const chainListPromise = store.dispatch(fetchChainConfigs());

  // we fetch the configuration for all chain
  const boostListPromise = store.dispatch(fetchAllBoosts());
  const vaultListFulfill = captureFulfill(fetchAllVaults());

  // we can start fetching prices right now and await them later
  const pricesPromise = store.dispatch(fetchAllPricesAction());

  // create the wallet instance as soon as we get the chain list
  setTimeout(async () => {
    // we can start fetching apy, it will arrive when it wants, nothing depends on it
    store.dispatch(fetchApyAction());

    store.dispatch(fetchVaultsPinnedConfig());

    store.dispatch(fetchPartnersConfig());

    store.dispatch(fetchPlatforms());

    store.dispatch(fetchBridges());

    store.dispatch(fetchVaultsLastHarvests());

    store.dispatch(fetchOffChainCampaignsAction());

    // Zap (we need the data to know if zap is available for each vault)
    store.dispatch(fetchZapConfigsAction());
    store.dispatch(fetchZapSwapAggregatorsAction());
    store.dispatch(fetchZapAggregatorTokenSupportAction());
    store.dispatch(fetchZapAmmsAction());
  });

  // create the wallet instance as soon as we get the chain list
  setTimeout(async () => {
    await chainListPromise;
    store.dispatch(initWallet());
  });

  // we need config data (for contract addresses) to start querying the rest
  await chainListPromise;
  // pre-load the addressbook
  const addressBookPromise = store.dispatch(fetchAllAddressBookAction());
  // we need the chain list to handle the vault list
  store.dispatch((await vaultListFulfill)());
  await boostListPromise;
  await addressBookPromise;

  // then, we work by chain

  // now we start fetching all data for all chains
  const fulfillsByNet: {
    [chainId in ChainEntity['id']]?: CapturedFulfilledActions;
  } = {};
  for (const chain of chains) {
    fulfillsByNet[chain.id] = {
      contractData: captureFulfill(fetchAllContractDataByChainAction({ chainId: chain.id })),
      user: undefined,
    };
    const walletAddress = selectWalletAddress(store.getState());
    if (walletAddress) {
      fulfillsByNet[chain.id]!.user = fetchCaptureUserData(store, chain.id, walletAddress);
    }
  }

  // ok now we started all calls, it's just a matter of ordering fulfill actions

  // before doing anything else, we need our prices
  await pricesPromise;

  for (const chain of chains) {
    // run in an async block se we don't wait for a slow chain
    (async () => {
      const chainFfs = fulfillsByNet[chain.id];
      if (chainFfs) {
        await store.dispatch((await chainFfs.contractData)());
        if (chainFfs.user !== undefined) {
          return dispatchUserFfs(store, chainFfs.user);
        }
      }
    })().catch(err => {
      // as we still dispatch network errors, for reducers to handle
      // there is not much to do here, this is just to avoid
      // "unhandled promise exception" messages in the console
      console.warn(err);
    });
  }

  // ok all data is fetched, now we start the poll functions

  if (featureFlag_noDataPolling()) {
    console.debug('Polling disabled');
    try {
      window['__manual_poll'] = () => store.dispatch(manualPoll());
      console.debug('Use window.__manual_poll(); to simulate.');
    } catch {
      // ignore
    }
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
    return Promise.all([store.dispatch(fetchAllPricesAction()), store.dispatch(fetchApyAction())]);
  }, 45 * 1000 /* every 45s */);
  pollStopFns.push(pollStop);

  // regular calls to update last harvest
  pollStop = poll(async () => {
    return store.dispatch(fetchVaultsLastHarvests());
  }, 3 * 60 * 1000 /* every 3 minutes */);
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
      const walletAddress = selectWalletAddress(store.getState());
      if (!walletAddress) {
        return;
      }
      // trigger all calls at the same time
      const fulfills = fetchCaptureUserData(store, chain.id, walletAddress);

      // dispatch fulfills in order
      await dispatchUserFfs(store, fulfills);
    }, 60 * 1000 /* every 60s */);
    pollStopFns.push(pollStop);
  }

  preLoadPages();
}

export function manualPoll(): BeefyThunk {
  return (dispatch, getState) => {
    const state = getState();
    const chains = selectAllChainIds(state);

    dispatch(recomputeBoostStatus());
    dispatch(fetchAllPricesAction());
    dispatch(fetchApyAction());

    for (const chainId of chains) {
      dispatch(fetchAllContractDataByChainAction({ chainId: chainId }));
    }

    if (selectIsWalletKnown(state)) {
      const walletAddress = selectWalletAddress(state);
      if (walletAddress) {
        for (const chainId of chains) {
          dispatch(fetchAllBalanceAction({ chainId, walletAddress }));
        }
      }
    }
  };
}

export function fetchCaptureUserData(
  store: BeefyStore,
  chainId: ChainEntity['id'],
  walletAddress: string
): Exclude<CapturedFulfilledActions['user'], undefined> {
  const captureFulfill = createFulfilledActionCapturer(store);

  return {
    balance: captureFulfill(fetchAllBalanceAction({ chainId, walletAddress })),
    // TODO: do we really need to fetch allowances right now?
    //allowance: captureFulfill(fetchAllAllowanceAction({ chainId, walletAddress })),
  };
}

export async function dispatchUserFfs(
  store: BeefyStore,
  userFfs: Exclude<CapturedFulfilledActions['user'], undefined>
) {
  await store.dispatch((await userFfs.balance)());
  //await store.dispatch((await userFfs.allowance)());
}

/**
 * we want to preload the vault page to make it fast on the first click
 */
function preLoadPages() {
  window.setTimeout(() => {
    window.requestIdleCallback(async () => {
      console.debug('pre-loading vault page...');
      await import('../../../features/vault');
      console.debug('pre-loading vault page done');
    });
  }, 10_000);
}
