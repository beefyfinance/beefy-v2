import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NewVersionAvailable, VersionState } from './ui-version-types.ts';

const initialState: VersionState = {
  updateAvailable: false,
} as VersionState;

export const versionSlice = createSlice({
  name: 'ui-version',
  initialState,
  reducers: {
    setUpdateAvailable(_, action: PayloadAction<NewVersionAvailable>) {
      return {
        updateAvailable: true,
        ...action.payload,
      };
    },
  },
});

export const { setUpdateAvailable } = versionSlice.actions;
export const versionReducer = versionSlice.reducer;
