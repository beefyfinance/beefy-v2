import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { PlatformEntity } from '../entities/platform';
import { KeysOfType } from '../utils/types-utils';
import { VaultEntity } from '../entities/vault';

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
