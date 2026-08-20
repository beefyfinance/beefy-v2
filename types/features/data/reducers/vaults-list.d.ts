import { type PayloadAction } from '@reduxjs/toolkit';
import type { VaultsListState } from './vaults-list-types';
export declare const vaultsListSlice: import("@reduxjs/toolkit").Slice<VaultsListState, {
    setVaultsLast(sliceState: import("immer").WritableDraft<VaultsListState>, action: PayloadAction<string | undefined>): void;
    setDashboardLast(sliceState: import("immer").WritableDraft<VaultsListState>, action: PayloadAction<string | undefined>): void;
}, "vaults-list", "vaults-list", import("@reduxjs/toolkit").SliceSelectors<VaultsListState>>;
export declare const setVaultsLast: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<string | undefined, "vaults-list/setVaultsLast">, setDashboardLast: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<string | undefined, "vaults-list/setDashboardLast">;
export declare const vaultsListReducer: import("redux").Reducer<VaultsListState>;
