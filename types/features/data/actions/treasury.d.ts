import type { AddressHoldingByChainId } from '../reducers/treasury-types';
import type { BeefyState } from '../store/types';
export interface FetchTreasuryFulfilledPayload {
    addressHoldingByChainId: AddressHoldingByChainId;
}
export declare const fetchTreasury: import("@reduxjs/toolkit").AsyncThunk<FetchTreasuryFulfilledPayload, void, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
