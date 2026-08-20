import type { FetchAllAllowanceResult } from '../apis/allowance/allowance-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenErc20 } from '../entities/token';
interface ActionParams {
    chainId: ChainEntity['id'];
    walletAddress: string;
}
export interface FetchAllAllowanceFulfilledPayload {
    chainId: ChainEntity['id'];
    data: FetchAllAllowanceResult;
}
export declare const fetchAllAllowanceAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllAllowanceFulfilledPayload, ActionParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
interface FetchAllowanceActionParams {
    chainId: ChainEntity['id'];
    spenderAddress: string;
    tokens: TokenErc20[];
    walletAddress: string;
}
export declare const fetchAllowanceAction: import("@reduxjs/toolkit").AsyncThunk<FetchAllAllowanceFulfilledPayload, FetchAllowanceActionParams, {
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
