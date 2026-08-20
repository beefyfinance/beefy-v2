import type { TenderlyState } from './tenderly-types';
export declare const tenderlySlice: import("@reduxjs/toolkit").Slice<TenderlyState, {
    tenderlyClose: (state: import("immer").WritableDraft<TenderlyState>) => void;
    tenderlyOpenLogin: (state: import("immer").WritableDraft<TenderlyState>) => void;
}, "tenderly", "tenderly", import("@reduxjs/toolkit").SliceSelectors<TenderlyState>>;
export declare const tenderlyReducer: import("redux").Reducer<TenderlyState>;
export declare const tenderlyClose: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"tenderly/tenderlyClose">, tenderlyOpenLogin: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"tenderly/tenderlyOpenLogin">;
