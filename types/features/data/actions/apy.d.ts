import type { BeefyAPIApyBreakdownResponse } from '../apis/beefy/beefy-api-types';
import { type VaultEntity } from '../entities/vault';
import type { AvgApy, RawAvgApy, TotalApy } from '../reducers/apy-types';
export interface FetchAllApyFulfilledPayload {
    data: BeefyAPIApyBreakdownResponse;
}
export declare const fetchApyAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllApyFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export interface FetchAvgApysFulfilledPayload {
    data: Record<string, RawAvgApy>;
}
export declare const fetchAvgApyAction: import("@reduxjs/toolkit").AsyncThunk<FetchAvgApysFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type FetchAvgApyFulfilledPayload = {
    data: Record<string, AvgApy>;
};
export declare const recalculateAvgApyAction: import("@reduxjs/toolkit").AsyncThunk<FetchAvgApyFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type RecalculateTotalApyPayload = {
    totals: Record<VaultEntity['id'], TotalApy>;
};
export declare const recalculateTotalApyAction: import("@reduxjs/toolkit").AsyncThunk<RecalculateTotalApyPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
