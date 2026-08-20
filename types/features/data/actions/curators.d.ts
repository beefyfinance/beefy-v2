import type { CuratorConfig } from '../apis/config-types';
export type FetchCuratorsPayload = CuratorConfig[];
export declare const fetchCurators: import("@reduxjs/toolkit").AsyncThunk<FetchCuratorsPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
