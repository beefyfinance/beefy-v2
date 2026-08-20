import type { MessageListResponse } from '../apis/cctp/cctp-api-types';
import type { ChainEntity } from '../entities/chain';
import type { DstTokenReturned } from '../reducers/wallet/stepper-types';
import type { BeefyState, BeefyThunk } from '../store/types';
export declare const fetchCCTPBridgeStatusByTxHash: import("@reduxjs/toolkit").AsyncThunk<MessageListResponse, {
    srcChainId: ChainEntity["id"];
    txHash: string;
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare function pollCCTPBridgeStatus({ srcChainId, txHash, }: {
    srcChainId: ChainEntity['id'];
    txHash: string;
}): BeefyThunk;
export declare const fetchCCTPDstTokensReturned: import("@reduxjs/toolkit").AsyncThunk<DstTokenReturned[], {
    destChainId: ChainEntity["id"];
    dstTxHash: string;
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchCrossChainSrcTokensReturned: import("@reduxjs/toolkit").AsyncThunk<DstTokenReturned[], {
    srcChainId: ChainEntity["id"];
    srcTxHash: string;
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
