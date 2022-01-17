import { createSlice } from '@reduxjs/toolkit';
import { fetchPricesAction, fetchVaultListAction } from '../actions/prices';

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
}
const dataLoaderInitialState: DataLoaderState = {
  vaultsLoading: dataLoaderStateInit,
  pricesLoading: dataLoaderStateInit,
  tvlLoading: dataLoaderStateInit,
};
export const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: dataLoaderInitialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // TODO: WIP
    // this could be abstracted away in a function
    // keeping it here so we can understand this code without much headhache
    builder.addCase(fetchPricesAction.pending, state => {
      state.pricesLoading = dataLoaderStatePending;
    });
    builder.addCase(fetchPricesAction.rejected, (state, action) => {
      // here, maybe put an error message
      state.pricesLoading = { status: 'rejected', error: action.error + '' };
    });
    builder.addCase(fetchPricesAction.fulfilled, state => {
      state.pricesLoading = dataLoaderStateFulfilled;
    });

    // handle all 3 cases for each action
    // or just replace these with a smarter loop ^^
    builder.addCase(fetchVaultListAction.pending, state => {
      state.vaultsLoading = dataLoaderStatePending;
    });
    builder.addCase(fetchVaultListAction.rejected, (state, action) => {
      // here, maybe put an error message
      state.vaultsLoading = { status: 'rejected', error: action.error + '' };
    });
    builder.addCase(fetchVaultListAction.fulfilled, state => {
      state.vaultsLoading = dataLoaderStateFulfilled;
    });
  },
});
