import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export type RecalculateFilteredVaultsParams = {
    dataChanged?: boolean;
    filtersChanged?: boolean;
    sortChanged?: boolean;
};
export type RecalculateFilteredVaultsPayload = {
    filtered: VaultEntity['id'][];
    sorted: VaultEntity['id'][];
};
export declare const recalculateFilteredVaultsAction: import("@reduxjs/toolkit").AsyncThunk<RecalculateFilteredVaultsPayload, RecalculateFilteredVaultsParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
