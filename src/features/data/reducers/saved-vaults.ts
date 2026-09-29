import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { VaultEntity } from '../entities/vault.ts';
import type { SavedVaultsState } from './saved-vaults-type.ts';

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
    /** re-key saved ids whose list row changed, e.g. a CLM wrapper now shown as its CLM's row */
    reconcile(sliceState, action: PayloadAction<Record<VaultEntity['id'], VaultEntity['id']>>) {
      for (const [fromId, toId] of Object.entries(action.payload)) {
        delete sliceState.byVaultId[fromId];
        sliceState.byVaultId[toId] = true;
      }
    },
  },
});

export const savedVaultsActions = savedVaultsSlice.actions;
