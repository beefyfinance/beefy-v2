import { type PayloadAction } from '@reduxjs/toolkit';
import type { ApyContractState, ApyState } from './apy-types';
export declare const initialApyState: ApyState;
export declare const apySlice: import("@reduxjs/toolkit").Slice<ApyState, {
    setApyContractState: (sliceState: import("immer").WritableDraft<ApyState>, action: PayloadAction<ApyContractState>) => void;
}, "apy", "apy", import("@reduxjs/toolkit").SliceSelectors<ApyState>>;
export declare const setApyContractState: import("@reduxjs/toolkit").ActionCreatorWithPayload<ApyContractState, "apy/setApyContractState">;
