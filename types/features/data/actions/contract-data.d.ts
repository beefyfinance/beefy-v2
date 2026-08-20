import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import type { ChainEntity } from '../entities/chain';
interface ActionParams {
    chainId: ChainEntity['id'];
}
export interface FetchAllContractDataFulfilledPayload {
    chainId: ChainEntity['id'];
    contractData: FetchAllContractDataResult;
}
export declare const fetchAllContractDataByChainAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllContractDataFulfilledPayload, ActionParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export {};
