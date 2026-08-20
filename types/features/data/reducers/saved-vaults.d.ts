import type { PayloadAction } from '@reduxjs/toolkit';
import type { VaultEntity } from '../entities/vault';
import type { SavedVaultsState } from './saved-vaults-type';
export declare const savedVaultsSlice: import("@reduxjs/toolkit").Slice<SavedVaultsState, {
    setSavedVaultIds(sliceState: import("immer").WritableDraft<SavedVaultsState>, action: PayloadAction<VaultEntity["id"]>): void;
}, "saved-vaults", "saved-vaults", import("@reduxjs/toolkit").SliceSelectors<SavedVaultsState>>;
export declare const savedVaultsActions: import("@reduxjs/toolkit").CaseReducerActions<{
    setSavedVaultIds(sliceState: import("immer").WritableDraft<SavedVaultsState>, action: PayloadAction<VaultEntity["id"]>): void;
}, "saved-vaults">;
