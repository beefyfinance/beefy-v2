import { createSlice } from '@reduxjs/toolkit';
import { fetchUserGeoCountry } from '../actions/restrictions.ts';
import type { RestrictionsState } from './restrictions-types.ts';

const initialRestrictionsState: RestrictionsState = {
  countryCode: undefined,
};

export const restrictionsSlice = createSlice({
  name: 'restrictions',
  initialState: initialRestrictionsState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchUserGeoCountry.fulfilled, (sliceState, action) => {
      sliceState.countryCode = action.payload.country || undefined;
    });
  },
});
