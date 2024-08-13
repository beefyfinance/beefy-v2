import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type BuildVersion = {
  /** git commit hash of build */
  git?: string;
  /** unix timestamp of build */
  timestamp: number;
  /** manifest content hash of build */
  content: string;
};

export type NewVersionAvailable = {
  currentVersion: BuildVersion;
  newVersion: BuildVersion;
  reloadFailed: boolean;
};

export type VersionState =
  | {
      updateAvailable: false;
    }
  | ({
      updateAvailable: true;
    } & NewVersionAvailable);

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
