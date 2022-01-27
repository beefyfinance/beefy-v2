import { Action } from 'redux';
import { store } from '../../../store';
import { ChainEntity } from '../entities/chain';
import {
  accountHasChanged,
  chainHasChanged,
  chainHasChangedToUnsupported,
  userDidConnect,
  walletHasDisconnected,
} from '../reducers/wallet';
import { selectAllChains } from '../selectors/chains';
import { selectCurrentChainId, selectIsWalletConnected } from '../selectors/wallet';
import { createFulfilledActionCapturer, poll, PollStop } from '../utils/async-utils';
import { fetchApyAction } from './apy';
import { fetchBoostContractDataAction } from './boost-contract';
import { fetchAllBoosts } from './boosts';
import { fetchChainConfigs } from './chains';
import { fetchLPPricesAction, fetchPricesAction } from './prices';
import {
  fetchGovVaultContractDataAction,
  fetchStandardVaultContractDataAction,
} from './vault-contract';
import { fetchAllVaults } from './vaults';
import {
  fetchBoostBalanceAction,
  fetchGovVaultPoolsBalanceAction,
  fetchTokenBalanceAction,
} from './balance';
import {
  fetchBoostAllowanceAction,
  fetchGovVaultPoolsAllowanceAction,
  fetchStandardVaultAllowanceAction,
} from './allowance';
import { getWalletConnectInstance } from '../apis/instances';

type CapturedFulfilledActionGetter = Promise<() => Action>;
interface CapturedFulfilledActions {
  standardVaults: CapturedFulfilledActionGetter;
  govVaults: CapturedFulfilledActionGetter;
  boosts: CapturedFulfilledActionGetter;
  user: {
    tokenBalance: CapturedFulfilledActionGetter;
    govVaultBalance: CapturedFulfilledActionGetter;
    boostBalance: CapturedFulfilledActionGetter;
    boostAllowance: CapturedFulfilledActionGetter;
    govVaultAllowance: CapturedFulfilledActionGetter;
    standardVaultAllowance: CapturedFulfilledActionGetter;
  } | null;
}

let pollStopFns: PollStop[] = [];

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

/**
 * Fetch all necessary information for the home page
 * TODO: we need to inject the store in parameters somehow and not get if from a global import
 */
export async function initHomeDataV3() {
  console.time('From scenario start');
  console.timeLog('From scenario start');

  const captureFulfill = createFulfilledActionCapturer(store);

  // start fetching chain config
  const chainListPromise = store.dispatch(fetchChainConfigs());

  // create the wallet instance as soon as we get the chain list
  (async () => {
    await chainListPromise;
    console.timeLog('From scenario start');
    console.log('Chain Config Loaded');

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
    //const defaultChainId = 'bsc';
    //return walletCo.askUserToConnectIfNeeded(defaultChainId);
  })();

  // we can start fetching prices right now and await them later
  const pricesPromise = Promise.all([
    store.dispatch(fetchPricesAction({})),
    store.dispatch(fetchLPPricesAction({})),
  ]);

  // we can start fetching apy, it will arrive when it wants, nothing depends on it
  store.dispatch(fetchApyAction({}));

  // then, we work by chain

  // we fetch the configuration for each chain
  // we need config data (for contract addresses) to start querying the rest
  await Promise.all([store.dispatch(fetchAllBoosts()), store.dispatch(fetchAllVaults())]);
  console.timeLog('From scenario start');
  console.log(`Vaults and boost list for all chains OK`);

  // now we start fetching all data for all chains
  const fulfillsByNet: {
    [chainId: ChainEntity['id']]: CapturedFulfilledActions;
  } = {};
  for (const chain of chains) {
    (async () => {
      // if user is connected, start fetching balances and allowances
      let userFullfills: CapturedFulfilledActions['user'] = null;
      if (selectIsWalletConnected(store.getState())) {
        userFullfills = fetchCaptureUserData(chain.id);
      }

      // startfetching all contract-related data at the same time
      fulfillsByNet[chain.id] = {
        standardVaults: captureFulfill(fetchStandardVaultContractDataAction({ chainId: chain.id })),
        govVaults: captureFulfill(fetchGovVaultContractDataAction({ chainId: chain.id })),
        boosts: captureFulfill(fetchBoostContractDataAction({ chainId: chain.id })),
        user: userFullfills,
      };
      console.timeLog('From scenario start');
      console.log(`Vaults and boost contract for chain ${chain.id} FETCHING`);
    })().catch(err => {
      // as we still dispatch network errors, for reducers to handle
      // there is not much to do here, this is just to avoid
      // "unhandled promise exception" messages in the console
      console.warn(err);
    });
  }

  // ok now we started all calls, it's just a matter of ordering fulfill actions

  // before doing anything else, we need our prices
  await pricesPromise;

  for (const chain of chains) {
    (async () => {
      const chainFfs = fulfillsByNet[chain.id];
      // dispatch fulfills in order
      await store.dispatch((await chainFfs.standardVaults)());
      await store.dispatch((await chainFfs.govVaults)());
      await store.dispatch((await chainFfs.boosts)());

      console.timeLog('From scenario start');
      console.log(`Vaults and boost contract for chain ${chain.id} OK`);

      // user ffs can be dispatched in any order after that
      if (chainFfs.user !== null) {
        dispatchUserFfs(chainFfs.user);
      }
    })().catch(err => {
      // as we still dispatch network errors, for reducers to handle
      // there is not much to do here, this is just to avoid
      // "unhandled promise exception" messages in the console
      console.warn(err);
    });
  }

  // ok all data is fetched, now we start the poll functions

  // disable for debugging
  return;

  // cancel regular polls if we already have some
  for (const stop of pollStopFns) {
    stop();
  }
  pollStopFns = [];

  // now set regular calls to update prices
  const pollStop = poll(async () => {
    return Promise.all([
      store.dispatch(fetchPricesAction({})),
      store.dispatch(fetchLPPricesAction({})),
      store.dispatch(fetchApyAction({})),
    ]);
  }, 45 * 1000 /* every 45s */);
  pollStopFns.push(pollStop);

  // now set regular calls to update contract data
  for (const chain of chains) {
    const pollStop = poll(async () => {
      // trigger all calls at the same time
      const fulfills: Omit<CapturedFulfilledActions, 'user'> = {
        standardVaults: captureFulfill(fetchStandardVaultContractDataAction({ chainId: chain.id })),
        govVaults: captureFulfill(fetchGovVaultContractDataAction({ chainId: chain.id })),
        boosts: captureFulfill(fetchBoostContractDataAction({ chainId: chain.id })),
      };

      // dispatch fulfills in order
      await store.dispatch((await fulfills.standardVaults)());
      await store.dispatch((await fulfills.govVaults)());
      await store.dispatch((await fulfills.boosts)());
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

// when some wallet actions are triggered, do trigger balance and allowance lookups
export function walletActionsMiddleware(store) {
  return next => async (action: { type: string; payload: { chainId?: ChainEntity['id'] } }) => {
    await next(action);

    let userFfs: CapturedFulfilledActions['user'] = null;
    switch (action.type) {
      case userDidConnect.type:
        userFfs = fetchCaptureUserData(action.payload.chainId);
        break;
      case accountHasChanged.type:
        const chainId = selectCurrentChainId(store.getState());
        userFfs = fetchCaptureUserData(chainId);
        break;
    }

    if (userFfs) {
      await dispatchUserFfs(userFfs);
    }
  };
}

function fetchCaptureUserData(chainId: ChainEntity['id']): CapturedFulfilledActions['user'] {
  const captureFulfill = createFulfilledActionCapturer(store);
  return {
    govVaultBalance: captureFulfill(fetchGovVaultPoolsBalanceAction({ chainId })),
    tokenBalance: captureFulfill(fetchTokenBalanceAction({ chainId })),
    boostBalance: captureFulfill(fetchBoostBalanceAction({ chainId })),
    // TODO: do we really need to fetch allowances right now?
    boostAllowance: captureFulfill(fetchBoostAllowanceAction({ chainId })),
    govVaultAllowance: captureFulfill(fetchGovVaultPoolsAllowanceAction({ chainId })),
    standardVaultAllowance: captureFulfill(fetchStandardVaultAllowanceAction({ chainId })),
  };
}

async function dispatchUserFfs(userFfs: CapturedFulfilledActions['user']) {
  await store.dispatch((await userFfs.tokenBalance)());
  await store.dispatch((await userFfs.govVaultBalance)());
  await store.dispatch((await userFfs.boostBalance)());
  await store.dispatch((await userFfs.boostAllowance)());
  await store.dispatch((await userFfs.govVaultAllowance)());
  await store.dispatch((await userFfs.standardVaultAllowance)());
}
