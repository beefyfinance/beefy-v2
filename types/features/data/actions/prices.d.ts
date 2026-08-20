import type { BeefyAPILpBreakdownResponse, BeefyAPITokenPricesResponse } from '../apis/beefy/beefy-api-types';
export type fetchAllPricesPayload = {
    prices: BeefyAPITokenPricesResponse;
    breakdowns: BeefyAPILpBreakdownResponse;
};
export declare const fetchAllPricesAction: import("@reduxjs/toolkit").AsyncThunk<fetchAllPricesPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
