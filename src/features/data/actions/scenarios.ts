import { Action } from 'redux';
import { storeV2 } from '../../../store';
import { ChainEntity } from '../entities/chain';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet';
import { selectAllChains } from '../selectors/chains';
import { selectIsWalletConnected } from '../selectors/wallet';
import { createFulfilledActionCapturer, poll, PollStop } from '../utils/async-utils';
import { fetchApyAction } from './apy';
import { fetchAllBoosts } from './boosts';
import { fetchChainConfigs } from './chains';
import { fetchAllPricesAction } from './prices';
import { fetchAllVaults } from './vaults';
import { fetchAllBalanceAction } from './balance';
import { getWalletConnectInstance } from '../apis/instances';
import { fetchAllContractDataByChainAction } from './contract-data';
import { featureFlag_dataPolling, featureFlag_scenarioTimings } from '../utils/feature-flags';
import { fetchAllAllowanceAction } from './allowance';

const store = storeV2;

type CapturedFulfilledActionGetter = Promise<() => Action>;
interface CapturedFulfilledActions {
  contractData: CapturedFulfilledActionGetter;
  user: {
    balance: CapturedFulfilledActionGetter;
    allowance: CapturedFulfilledActionGetter;
  } | null;
}

let pollStopFns: PollStop[] = [];

// todo: put this in a config
const chains = [
  'arbitrum',
  'avax',
  'celo',
  'cronos',
  'fantom',
  'fuse',
  'harmony',
  'heco',
  'metis',
  'moonriver',
  'polygon',
  // fetch BSC last, his multicall split in multiple calls
  // and that takes up all 6 simulatneous network calls
  // putting it last allow all other data to arrive faster
  'bsc',
].map(id => ({ id }));

/**
 * Fetch all necessary information for the home page
 * TODO: we need to inject the store in parameters somehow and not get if from a global import
 */
export async function initHomeDataV4() {
  if (featureFlag_scenarioTimings()) {
    console.time('From scenario start');
    console.timeLog('From scenario start');
  }

  const captureFulfill = createFulfilledActionCapturer(store);

  // start fetching chain config
  const chainListPromise = store.dispatch(fetchChainConfigs());

  // create the wallet instance as soon as we get the chain list
  setTimeout(async () => {
    await chainListPromise;
    if (featureFlag_scenarioTimings()) {
      console.timeLog('From scenario start');
      console.log('Chain Config Loaded');
    }

    const state = store.getState();
    const chains = selectAllChains(state);
    // instanciate and do the proper piping between both worlds
    const walletCo = getWalletConnectInstance({
      chains,
      onConnect: (chainId, address) => store.dispatch(userDidConnect({ chainId, address })),
      onAccountChanged: address => store.dispatch(accountHasChanged({ address })),
      onChainChanged: chainId => store.dispatch(chainHasChanged({ chainId })),
      onUnsupportedChainSelected: () => store.dispatch(chainHasChangedToUnsupported()),
      onWalletDisconnected: () => store.dispatch(walletHasDisconnected()),
    });

    // todo: take it from local storage
    const defaultChainId = 'bsc';
    return walletCo.askUserToConnectIfNeeded(defaultChainId);
  });

  // we fetch the configuration for all chain
  const boostsAndVaults = Promise.all([
    store.dispatch(fetchAllBoosts()),
    store.dispatch(fetchAllVaults()),
  ]);

  // we can start fetching prices right now and await them later
  const pricesPromise = store.dispatch(fetchAllPricesAction({}));
  // we can start fetching apy, it will arrive when it wants, nothing depends on it
  store.dispatch(fetchApyAction({}));

  // we need config data (for contract addresses) to start querying the rest
  await boostsAndVaults;

  if (featureFlag_scenarioTimings()) {
    console.timeLog('From scenario start');
    console.log(`Vaults and boost list for all chains OK`);
  }

  // then, we work by chain

  // now we start fetching all data for all chains
  const fulfillsByNet: {
    [chainId: ChainEntity['id']]: CapturedFulfilledActions;
  } = {};
  for (const chain of chains) {
    // if user is connected, start fetching balances and allowances
    let userFullfills: CapturedFulfilledActions['user'] = null;
    if (selectIsWalletConnected(store.getState())) {
      userFullfills = fetchCaptureUserData(chain.id);
    }

    // startfetching all contract-related data at the same time
    fulfillsByNet[chain.id] = {
      contractData: captureFulfill(fetchAllContractDataByChainAction({ chainId: chain.id })),
      user: userFullfills,
    };
    if (featureFlag_scenarioTimings()) {
      console.timeLog('From scenario start');
      console.log(`Vaults and boost contract for chain ${chain.id} FETCHING`);
    }
  }

  // ok now we started all calls, it's just a matter of ordering fulfill actions

  // before doing anything else, we need our prices
  await pricesPromise;

  for (const chain of chains) {
    setTimeout(() =>
      (async () => {
        const chainFfs = fulfillsByNet[chain.id];
        // dispatch fulfills in order
        await store.dispatch((await chainFfs.contractData)());

        if (featureFlag_scenarioTimings()) {
          console.timeLog('From scenario start');
          console.log(`Vaults and boost contract for chain ${chain.id} OK`);
        }

        // user ffs can be dispatched in any order after that
        if (chainFfs.user !== null) {
          dispatchUserFfs(chainFfs.user);
        }
      })().catch(err => {
        // as we still dispatch network errors, for reducers to handle
        // there is not much to do here, this is just to avoid
        // "unhandled promise exception" messages in the console
        console.warn(err);
      })
    );
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

  // now set regular calls to update prices
  const pollStop = poll(async () => {
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
      const fulfills = fetchCaptureUserData(chain.id);

      // dispatch fulfills in order
      await dispatchUserFfs(fulfills);
    }, 60 * 1000 /* every 60s */);
    pollStopFns.push(pollStop);
  }
}

// when some wallet actions are triggered (like connection or account changed)
// fetch balance and allowance again
export function walletActionsMiddleware(store) {
  return next => async (action: { type: string; payload: { chainId?: ChainEntity['id'] } }) => {
    await next(action);

    let userFfsByChain: { [chainId: ChainEntity['id']]: CapturedFulfilledActions['user'] } | null =
      null;
    switch (action.type) {
      case userDidConnect.type:
      case accountHasChanged.type:
        userFfsByChain = {};
        for (const chain of chains) {
          userFfsByChain[chain.id] = fetchCaptureUserData(chain.id);
        }
        break;
    }

    if (userFfsByChain !== null) {
      for (const chain of chains) {
        dispatchUserFfs(userFfsByChain[chain.id]);
      }
    }
  };
}

function fetchCaptureUserData(chainId: ChainEntity['id']): CapturedFulfilledActions['user'] {
  const captureFulfill = createFulfilledActionCapturer(store);
  if (featureFlag_scenarioTimings()) {
    console.timeLog('From scenario start');
    console.log(`balance and allowance for chain ${chainId} FETCHING`);
  }
  return {
    balance: captureFulfill(fetchAllBalanceAction({ chainId })),
    // TODO: do we really need to fetch allowances right now?
    allowance: captureFulfill(fetchAllAllowanceAction({ chainId })),
  };
}

async function dispatchUserFfs(userFfs: CapturedFulfilledActions['user']) {
  await store.dispatch((await userFfs.balance)());
  await store.dispatch((await userFfs.allowance)());
  if (featureFlag_scenarioTimings()) {
    console.timeLog('From scenario start');
    console.log(`balance and allowance for FETCHED`);
  }
}
