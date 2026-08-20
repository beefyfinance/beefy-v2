import type { PayloadAction } from '@reduxjs/toolkit';
import type { DataLoaderState } from './data-loader-types';
export declare const initialDataLoaderState: DataLoaderState;
export declare const dataLoaderSlice: import("@reduxjs/toolkit").Slice<DataLoaderState, {
    dismissNotification(sliceState: import("immer").WritableDraft<DataLoaderState>, action: PayloadAction<{
        walletAddress?: string;
    }>): void;
}, "dataLoader", "dataLoader", import("@reduxjs/toolkit").SliceSelectors<DataLoaderState>>;
export declare const dataLoaderActions: import("@reduxjs/toolkit").CaseReducerActions<{
    dismissNotification(sliceState: import("immer").WritableDraft<DataLoaderState>, action: PayloadAction<{
        walletAddress?: string;
    }>): void;
}, "dataLoader">;
