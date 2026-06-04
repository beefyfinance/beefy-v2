import { createSlice } from '@reduxjs/toolkit';
import { fetchFeaturedVaults } from '../actions/featured-vaults.ts';
import type { FeaturedVaultsState } from './featured-vaults-types.ts';

export const initialFeaturedVaultsState: FeaturedVaultsState = {
  vaultIds: [],
};

export const featuredVaultsSlice = createSlice({
  name: 'featuredVaults',
  initialState: initialFeaturedVaultsState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchFeaturedVaults.fulfilled, (sliceState, action) => {
      sliceState.vaultIds = action.payload;
    });
  },
});
