import { ChainEntity } from '../entities/chain';

/**
 * because we want to be smart about data loading
 * I think we need a dedicated "loading" slice
 * where we can ask which data is loading and which data is loaded
 * this will simplify other slices as they can focus on data
 * and this slice can focus on data fetching
 * maybe it's dumb though, but it can be refactored
 **/
interface LoaderStateInit {
  alreadyLoadedOnce: boolean;
  status: 'init';
  error: null;
}

interface LoaderStatePending {
  alreadyLoadedOnce: boolean;
  status: 'pending';
  error: null;
}

interface LoaderStateRejected {
  alreadyLoadedOnce: boolean;
  status: 'rejected';
  error: string;
}

interface LoaderStateFulfilled {
  alreadyLoadedOnce: boolean;
  status: 'fulfilled';
  error: null;
}

export type LoaderState =
  | LoaderStateInit
  | LoaderStatePending
  | LoaderStateRejected
  | LoaderStateFulfilled;

// some example of a type guard
export function isFulfilled(state: LoaderState): state is LoaderStateFulfilled {
  return state.status === 'fulfilled';
}

export function isPending(state: LoaderState): state is LoaderStatePending {
  return state.status === 'pending';
}

export function isInitialLoader(state: LoaderState): state is LoaderStateInit {
  return state.status === 'init';
}

export function isRejected(state: LoaderState): state is LoaderStateRejected {
  return state.status === 'rejected';
}

export interface DataLoaderState {
  instances: {
    wallet: boolean;
  };
  statusIndicator: {
    open: boolean;
  };
  global: {
    chainConfig: LoaderState;
    prices: LoaderState;
    apy: LoaderState;
    vaults: LoaderState;
    fees: LoaderState;
    boosts: LoaderState;
    wallet: LoaderState;
    amms: LoaderState;
    zaps: LoaderState;
    depositForm: LoaderState;
    withdrawForm: LoaderState;
    boostForm: LoaderState;
    addressBook: LoaderState;
    minters: LoaderState;
    minterForm: LoaderState;
    infoCards: LoaderState;
    bridge: LoaderState;
    platforms: LoaderState;
    onRamp: LoaderState;
    treasury: LoaderState;
  };
  byChainId: {
    [chainId: ChainEntity['id']]: {
      contractData: LoaderState;
      balance: LoaderState;
      allowance: LoaderState;
      addressBook: LoaderState;
    };
  };
}
