import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchBoostAllowanceAction,
  fetchGovVaultPoolsAllowanceAction,
  fetchStandardVaultAllowanceAction,
} from '../actions/allowance';
import { fetchApyAction, fetchHistoricalApy } from '../actions/apy';
import {
  fetchBoostBalanceAction,
  fetchGovVaultPoolsBalanceAction,
  fetchTokenBalanceAction,
} from '../actions/balance';
import { fetchBoostContractDataAction } from '../actions/boost-contract';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchChainConfigs } from '../actions/chains';
import { fetchLPPricesAction, fetchPricesAction } from '../actions/prices';
import {
  fetchGovVaultContractDataAction,
  fetchStandardVaultContractDataAction,
} from '../actions/vault-contract';
import { fetchAllVaults } from '../actions/vaults';
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
  status: 'init';
  error: null;
}
interface LoaderStatePending {
  status: 'pending';
  error: null;
}
interface LoaderStateRejected {
  status: 'rejected';
  error: string;
}
interface LoaderStateFulfilled {
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

const dataLoaderStateInit: LoaderState = { status: 'init', error: null };
const dataLoaderStateFulfilled: LoaderState = { status: 'fulfilled', error: null };
const dataLoaderStatePending: LoaderState = { status: 'pending', error: null };
const dataLoaderStateInitByChainId: DataLoaderState['byChainId']['bsc'] = {
  govVaultContractData: dataLoaderStateInit,
  standardVaultContractData: dataLoaderStateInit,
  boostContractData: dataLoaderStateInit,
  govVaultBalance: dataLoaderStateInit,
  tokenBalance: dataLoaderStateInit,
  boostBalance: dataLoaderStateInit,
  boostAllowance: dataLoaderStateInit,
  govVaultAllowance: dataLoaderStateInit,
  standardVaultAllowance: dataLoaderStateInit,
};

export interface DataLoaderState {
  global: {
    chainConfig: LoaderState;
    prices: LoaderState;
    lpPrices: LoaderState;
    apy: LoaderState;
    vaults: LoaderState;
    boosts: LoaderState;
  };

  byChainId: {
    [chainId: ChainEntity['id']]: {
      govVaultContractData: LoaderState;
      standardVaultContractData: LoaderState;
      boostContractData: LoaderState;
      govVaultBalance: LoaderState;
      tokenBalance: LoaderState;
      boostBalance: LoaderState;
      boostAllowance: LoaderState;
      govVaultAllowance: LoaderState;
      standardVaultAllowance: LoaderState;
    };
  };
}
export const initialDataLoaderState: DataLoaderState = {
  global: {
    chainConfig: dataLoaderStateInit,
    prices: dataLoaderStateInit,
    lpPrices: dataLoaderStateInit,
    apy: dataLoaderStateInit,
    boosts: dataLoaderStateInit,
    vaults: dataLoaderStateInit,
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
    sliceState.global[stateKey] = dataLoaderStatePending;
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    // here, maybe put an error message
    sliceState.global[stateKey] = { status: 'rejected', error: action.error + '' };
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
    const chainId = action.meta.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    sliceState.byChainId[chainId][stateKey] = dataLoaderStatePending;
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    const chainId = action.meta.arg.chainId;
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = { ...dataLoaderStateInitByChainId };
    }
    // here, maybe put an error message
    sliceState.byChainId[chainId][stateKey] = { status: 'rejected', error: action.error + '' };
  });
  builder.addCase(action.fulfilled, (sliceState, action) => {
    const chainId = action.meta.arg.chainId;
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
    addGlobalAsyncThunkActions(builder, fetchPricesAction, 'prices');
    addGlobalAsyncThunkActions(builder, fetchLPPricesAction, 'lpPrices');
    addGlobalAsyncThunkActions(builder, fetchApyAction, 'apy');
    addGlobalAsyncThunkActions(builder, fetchAllVaults, 'vaults');
    addGlobalAsyncThunkActions(builder, fetchAllBoosts, 'boosts');

    addByChainAsyncThunkActions(builder, fetchGovVaultContractDataAction, 'govVaultContractData');
    addByChainAsyncThunkActions(
      builder,
      fetchStandardVaultContractDataAction,
      'standardVaultContractData'
    );
    addByChainAsyncThunkActions(builder, fetchBoostContractDataAction, 'boostContractData');
    addByChainAsyncThunkActions(builder, fetchGovVaultPoolsBalanceAction, 'govVaultBalance');
    addByChainAsyncThunkActions(builder, fetchTokenBalanceAction, 'tokenBalance');
    addByChainAsyncThunkActions(builder, fetchBoostBalanceAction, 'boostBalance');
    addByChainAsyncThunkActions(builder, fetchBoostAllowanceAction, 'boostAllowance');
    addByChainAsyncThunkActions(builder, fetchGovVaultPoolsAllowanceAction, 'govVaultAllowance');
    addByChainAsyncThunkActions(
      builder,
      fetchStandardVaultAllowanceAction,
      'standardVaultAllowance'
    );
  },
});
