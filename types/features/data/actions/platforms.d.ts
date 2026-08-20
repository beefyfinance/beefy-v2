import type { PlatformConfig } from '../apis/config-types';
export type FetchPlatformsPayload = PlatformConfig[];
export declare const fetchPlatforms: import("@reduxjs/toolkit").AsyncThunk<FetchPlatformsPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
