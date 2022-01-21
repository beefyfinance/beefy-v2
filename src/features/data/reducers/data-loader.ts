import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchApyAction, fetchHistoricalApy } from '../actions/apy';
import {  fetchPricesAction } from '../actions/prices';
import { fetchVaultByChainIdAction } from '../actions/vaults';

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

export interface DataLoaderState {
  vaultsLoading: LoaderState;
  pricesLoading: LoaderState;
  tvlLoading: LoaderState;
  apyLoading: LoaderState;
  historicalApyLoading: LoaderState;
}
export const initialDataLoaderState: DataLoaderState = {
  vaultsLoading: dataLoaderStateInit,
  pricesLoading: dataLoaderStateInit,
  tvlLoading: dataLoaderStateInit,
  apyLoading: dataLoaderStateInit,
  historicalApyLoading: dataLoaderStateInit,
};

/**
 * Handling those async actions is very generic
 * Use a helper function to handle each action state
 */
function addAsyncThunkActions(
  builder: ActionReducerMapBuilder<DataLoaderState>,
  action: AsyncThunk<unknown, unknown, unknown>,
  stateKey: keyof DataLoaderState
) {
  builder.addCase(action.pending, sliceState => {
    sliceState[stateKey] = dataLoaderStatePending;
  });
  builder.addCase(action.rejected, (sliceState, action) => {
    // here, maybe put an error message
    sliceState[stateKey] = { status: 'rejected', error: action.error + '' };
  });
  builder.addCase(action.fulfilled, sliceState => {
    sliceState[stateKey] = dataLoaderStateFulfilled;
  });
}

export const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: initialDataLoaderState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // TODO: WIP
    addAsyncThunkActions(builder, fetchPricesAction, 'pricesLoading');
    addAsyncThunkActions(builder, fetchVaultByChainIdAction, 'vaultsLoading');
    addAsyncThunkActions(builder, fetchApyAction, 'apyLoading');
    addAsyncThunkActions(builder, fetchHistoricalApy, 'historicalApyLoading');
  },
});
