import { type PayloadAction } from '@reduxjs/toolkit';
import type { TvlState } from './tvl-types';
export declare const initialTvlState: TvlState;
export declare const tvlSlice: import("@reduxjs/toolkit").Slice<TvlState, {
    setTvlContractState: (sliceState: import("immer").WritableDraft<TvlState>, action: PayloadAction<TvlState>) => void;
}, "tvl", "tvl", import("@reduxjs/toolkit").SliceSelectors<TvlState>>;
export declare const setTvlContractState: import("@reduxjs/toolkit").ActionCreatorWithPayload<TvlState, "tvl/setTvlContractState">;
