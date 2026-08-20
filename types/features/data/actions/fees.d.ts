import type { ApyFeeData } from '../apis/beefy/beefy-api-types';
export type FetchFeesFulfilledPayload = ApyFeeData;
export declare const fetchFees: import("@reduxjs/toolkit").AsyncThunk<ApyFeeData, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
