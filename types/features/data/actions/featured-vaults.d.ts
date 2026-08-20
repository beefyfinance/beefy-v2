import type { VaultEntity } from '../entities/vault';
export type FetchFeaturedVaultsPayload = VaultEntity['id'][];
export declare const fetchFeaturedVaults: import("@reduxjs/toolkit").AsyncThunk<FetchFeaturedVaultsPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
