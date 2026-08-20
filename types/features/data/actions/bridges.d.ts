import type { BridgeConfig } from '../apis/config-types';
export type FetchBridgesPayload = BridgeConfig[];
export declare const fetchBridges: import("@reduxjs/toolkit").AsyncThunk<FetchBridgesPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
