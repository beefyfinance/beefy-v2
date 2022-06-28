import {
  ActionReducerMapBuilder,
  AsyncThunk,
  createSlice,
  SerializedError,
} from '@reduxjs/toolkit';
import { isString } from 'lodash';
import { fetchAllAllowanceAction } from '../actions/allowance';
import { fetchApyAction } from '../actions/apy';
import { fetchAllBalanceAction } from '../actions/balance';
import { fetchAllBoosts, initiateBoostForm } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { initiateDepositForm } from '../actions/deposit';
import { fetchAllPricesAction } from '../actions/prices';
import {
  fetchAddressBookAction,
  fetchAllAddressBookAction,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData,
} from '../actions/tokens';
import { fetchAllVaults } from '../actions/vaults';
import {
  askForNetworkChange,
  askForWalletConnection,
  doDisconnectWallet,
  initWallet,
} from '../actions/wallet';
import { initiateWithdrawForm } from '../actions/withdraw';
import { fetchAllZapsAction } from '../actions/zap';
import { ChainEntity } from '../entities/chain';
import { fetchAllMinters, initiateMinterForm } from '../actions/minters';
import { fetchAllInfoCards } from '../actions/info-cards';
import { initiateBridgeForm } from '../actions/bridge';
import { fetchPlatforms } from '../actions/platforms';

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

const dataLoaderStateInit: LoaderState = {
  alreadyLoadedOnce: false,
  status: 'init',
  error: null,
};
const dataLoaderStateFulfilled: LoaderState = {
  alreadyLoadedOnce: true,
  status: 'fulfilled',
  error: null,
};
const dataLoaderStatePending: LoaderState = {
  alreadyLoadedOnce: false,
  status: 'pending',
  error: null,
};
const dataLoaderStateInitByChainId: DataLoaderState['byChainId']['bsc'] = {
  contractData: dataLoaderStateInit,
  balance: dataLoaderStateInit,
  allowance: dataLoaderStateInit,
  addressBook: dataLoaderStateInit,
};

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
    boosts: LoaderState;
    wallet: LoaderState;
    zaps: LoaderState;
    depositForm: LoaderState;
    withdrawForm: LoaderState;
    boostForm: LoaderState;
    addressBook: LoaderState;
    minters: LoaderState;
    minterForm: LoaderState;
    infoCards: LoaderState;
    bridgeForm: LoaderState;
    platforms: LoaderState;
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

export const initialDataLoaderState: DataLoaderState = {
  instances: {
    wallet: false,
  },
  statusIndicator: {
    open: false,
  },
  global: {
    chainConfig: dataLoaderStateInit,
    prices: dataLoaderStateInit,
    apy: dataLoaderStateInit,
    boosts: dataLoaderStateInit,
    vaults: dataLoaderStateInit,
    wallet: dataLoaderStateInit,
    zaps: dataLoaderStateInit,
    depositForm: dataLoaderStateInit,
    withdrawForm: dataLoaderStateInit,
    boostForm: dataLoaderStateInit,
    addressBook: dataLoaderStateInit,
    minters: dataLoaderStateInit,
    minterForm: dataLoaderStateInit,
    infoCards: dataLoaderStateInit,
    bridgeForm: dataLoaderStateInit,
    platforms: dataLoaderStateInit,
  },
  byChainId: {},
};

/**
 * Handling those async actions is very generic
 * Use a helper function to handle each action state
 */
function addGlobalAsyncThunkActions(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, unknown, unknown>,
  stateKey: keyof DataLoaderState['global'],
  openNetworkModalOnReject: boolean = false
) {
  builder.addCase(action.pending, sliceState => {
    sliceState.global[stateKey] = {
      ...dataLoaderStatePending,
      alreadyLoadedOnce: sliceState.global[stateKey].alreadyLoadedOnce,
    };
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const msg = getMessage(action.error);
    // here, maybe put an error message
    sliceState.global[stateKey] = {
      status: 'rejected',
      error: msg,
      alreadyLoadedOnce: sliceState.global[stateKey].alreadyLoadedOnce,
    };

    // something got rejected, we want to auto-open the indicator
    if (openNetworkModalOnReject) {
      sliceState.statusIndicator.open = true;
    }
  });
  builder.addCase(action.fulfilled, sliceState => {
    sliceState.global[stateKey] = dataLoaderStateFulfilled;
  });
}

function addByChainAsyncThunkActions<ActionParams extends { chainId: string }>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, unknown>,
  stateKeys: Array<keyof DataLoaderState['byChainId']['bsc']>
) {
  builder.addCase(action.pending, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    for (const stateKey of stateKeys) {
      sliceState.byChainId[chainId][stateKey] = {
        ...dataLoaderStatePending,
        alreadyLoadedOnce: sliceState.byChainId[chainId][stateKey].alreadyLoadedOnce,
      };
    }
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }

    const msg = getMessage(action.error);
    // here, maybe put an error message
    for (const stateKey of stateKeys) {
      sliceState.byChainId[chainId][stateKey] = {
        alreadyLoadedOnce: sliceState.byChainId[chainId][stateKey].alreadyLoadedOnce,
        status: 'rejected',
        error: msg,
      };

      // something got rejected, we want to auto-open the indicator
      sliceState.statusIndicator.open = true;
    }
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    for (const stateKey of stateKeys) {
      sliceState.byChainId[chainId][stateKey] = dataLoaderStateFulfilled;
    }
  });
}

export const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: initialDataLoaderState,
  reducers: {
    closeIndicator(sliceState) {
      sliceState.statusIndicator.open = false;
    },
    openIndicator(sliceState) {
      sliceState.statusIndicator.open = true;
    },
  },
  extraReducers: builder => {
    addGlobalAsyncThunkActions(builder, fetchChainConfigs, 'chainConfig', true);
    addGlobalAsyncThunkActions(builder, askForWalletConnection, 'wallet', false);
    addGlobalAsyncThunkActions(builder, initWallet, 'wallet', false);
    addGlobalAsyncThunkActions(builder, doDisconnectWallet, 'wallet', false);
    addGlobalAsyncThunkActions(builder, askForNetworkChange, 'wallet', false);
    addGlobalAsyncThunkActions(builder, fetchAllPricesAction, 'prices', true);
    addGlobalAsyncThunkActions(builder, fetchApyAction, 'apy', true);
    addGlobalAsyncThunkActions(builder, fetchAllVaults, 'vaults', true);
    addGlobalAsyncThunkActions(builder, fetchAllBoosts, 'boosts', true);
    addGlobalAsyncThunkActions(builder, fetchAllMinters, 'minters', false);
    addGlobalAsyncThunkActions(builder, fetchAllInfoCards, 'infoCards', false);
    addGlobalAsyncThunkActions(builder, initiateDepositForm, 'depositForm', true);
    addGlobalAsyncThunkActions(builder, initiateWithdrawForm, 'withdrawForm', true);
    addGlobalAsyncThunkActions(builder, initiateBoostForm, 'boostForm', true);
    addGlobalAsyncThunkActions(builder, initiateMinterForm, 'minterForm', true);
    addGlobalAsyncThunkActions(builder, initiateBridgeForm, 'bridgeForm', true);
    addGlobalAsyncThunkActions(builder, fetchAllZapsAction, 'zaps', true);
    addGlobalAsyncThunkActions(builder, fetchAllAddressBookAction, 'addressBook', true);
    addGlobalAsyncThunkActions(builder, fetchPlatforms, 'platforms', true);
    addByChainAsyncThunkActions(builder, fetchAllContractDataByChainAction, ['contractData']);
    addByChainAsyncThunkActions(builder, fetchAllBalanceAction, ['balance']);
    addByChainAsyncThunkActions(builder, fetchAllAllowanceAction, ['allowance']);
    addByChainAsyncThunkActions(builder, reloadBalanceAndAllowanceAndGovRewardsAndBoostData, [
      'balance',
      'allowance',
    ]);
    addByChainAsyncThunkActions(builder, fetchAddressBookAction, ['addressBook']);
  },
});

function getMessage(error: SerializedError) {
  return isString(error) ? error : (error?.message || error?.name || error?.code) + '';
}

export const dataLoaderActions = dataLoaderSlice.actions;
