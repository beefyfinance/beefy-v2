import type { PartnersConfig } from '../apis/config-types';
export declare const fetchPartnersConfig: import("@reduxjs/toolkit").AsyncThunk<PartnersConfig, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
