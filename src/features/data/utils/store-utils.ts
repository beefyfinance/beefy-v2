import { asyncThunkCreator, buildCreateSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyDispatchFn, BeefyState } from '../store/types.ts';

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: BeefyState;
  dispatch: BeefyDispatchFn;
}>();
