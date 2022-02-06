import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllAllowanceAction } from '../actions/allowance';
import { fetchApyAction } from '../actions/apy';
import { fetchAllBalanceAction } from '../actions/balance';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { fetchAllPricesAction } from '../actions/prices';
import { fetchAllVaults } from '../actions/vaults';
import { askForNetworkChange, askForWalletConnection, doDisconnectWallet } from '../actions/wallet';
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
type LoaderState =
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
};

export interface DataLoaderState {
  global: {
    chainConfig: LoaderState;
    prices: LoaderState;
    apy: LoaderState;
    vaults: LoaderState;
    boosts: LoaderState;
    wallet: LoaderState;
  };

  byChainId: {
    [chainId: ChainEntity['id']]: {
      contractData: LoaderState;
      balance: LoaderState;
      allowance: LoaderState;
    };
  };
}
export const initialDataLoaderState: DataLoaderState = {
  global: {
    chainConfig: dataLoaderStateInit,
    prices: dataLoaderStateInit,
    apy: dataLoaderStateInit,
    boosts: dataLoaderStateInit,
    vaults: dataLoaderStateInit,
    wallet: dataLoaderStateInit,
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
  stateKey: keyof DataLoaderState['global']
) {
  builder.addCase(action.pending, sliceState => {
    sliceState.global[stateKey] = {
      ...dataLoaderStatePending,
      alreadyLoadedOnce: sliceState.global[stateKey].alreadyLoadedOnce,
    };
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    // here, maybe put an error message
    sliceState.global[stateKey] = {
      status: 'rejected',
      error: action.error + '',
      alreadyLoadedOnce: sliceState.global[stateKey].alreadyLoadedOnce,
    };
  });
  builder.addCase(action.fulfilled, sliceState => {
    sliceState.global[stateKey] = dataLoaderStateFulfilled;
  });
}

function addByChainAsyncThunkActions<ActionParams extends { chainId: string }>(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, ActionParams, unknown>,
  stateKey: keyof DataLoaderState['byChainId']['bsc']
) {
  builder.addCase(action.pending, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    sliceState.byChainId[chainId][stateKey] = {
      ...dataLoaderStatePending,
      alreadyLoadedOnce: sliceState.byChainId[chainId][stateKey].alreadyLoadedOnce,
    };
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    // here, maybe put an error message
    sliceState.byChainId[chainId][stateKey] = {
      alreadyLoadedOnce: sliceState.byChainId[chainId][stateKey].alreadyLoadedOnce,
      status: 'rejected',
      error: action.error + '',
    };
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    const chainId = action.meta?.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    // here, maybe put an error message
    sliceState.byChainId[chainId][stateKey] = dataLoaderStateFulfilled;
  });
}

export const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: initialDataLoaderState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    addGlobalAsyncThunkActions(builder, fetchChainConfigs, 'chainConfig');
    addGlobalAsyncThunkActions(builder, askForWalletConnection, 'wallet');
    addGlobalAsyncThunkActions(builder, doDisconnectWallet, 'wallet');
    addGlobalAsyncThunkActions(builder, askForNetworkChange, 'wallet');
    addGlobalAsyncThunkActions(builder, fetchAllPricesAction, 'prices');
    addGlobalAsyncThunkActions(builder, fetchApyAction, 'apy');
    addGlobalAsyncThunkActions(builder, fetchAllVaults, 'vaults');
    addGlobalAsyncThunkActions(builder, fetchAllBoosts, 'boosts');
    addByChainAsyncThunkActions(builder, fetchAllContractDataByChainAction, 'contractData');
    addByChainAsyncThunkActions(builder, fetchAllBalanceAction, 'balance');
    addByChainAsyncThunkActions(builder, fetchAllAllowanceAction, 'allowance');
  },
});
