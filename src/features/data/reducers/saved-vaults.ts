import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { VaultEntity } from '../entities/vault';

export type SavedVaultsState = {
  savedVaultIds: VaultEntity['id'][];
};

const initialSavedVaultsState: SavedVaultsState = {
  savedVaultIds: [],
};

export const savedVaultsSlice = createSlice({
  name: 'saved-vaults',
  initialState: initialSavedVaultsState,
  reducers: {
    setSavedVaultIds(sliceState, action: PayloadAction<SavedVaultsState['savedVaultIds']>) {
      sliceState.savedVaultIds = action.payload;
    },
  },
});

export const savedVaultsActions = savedVaultsSlice.actions;
