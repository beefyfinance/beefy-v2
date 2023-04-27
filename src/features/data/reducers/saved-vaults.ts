import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { VaultEntity } from '../entities/vault';

export type SavedVaultsState = {
  byVaultId: Record<VaultEntity['id'], boolean>;
};

const initialSavedVaultsState: SavedVaultsState = {
  byVaultId: {},
};

export const savedVaultsSlice = createSlice({
  name: 'saved-vaults',
  initialState: initialSavedVaultsState,

  reducers: {
    setSavedVaultIds(sliceState, action: PayloadAction<VaultEntity['id']>) {
      const vaultId = action.payload;
      const savedVaultIds = sliceState.byVaultId;
      if (savedVaultIds[vaultId]) {
        delete sliceState.byVaultId[vaultId];
      } else {
        sliceState.byVaultId[vaultId] = true;
      }
    },
  },
});

export const savedVaultsActions = savedVaultsSlice.actions;
