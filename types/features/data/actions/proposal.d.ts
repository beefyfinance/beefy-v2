import type { BeefySnapshotActiveResponse, BeefySnapshotProposal } from '../apis/beefy/beefy-api-types';
import type { ProposalEntity } from '../entities/proposal';
export type FetchActiveProposalsFulfilledPayload = {
    proposals: BeefySnapshotActiveResponse;
    read: BeefySnapshotProposal['id'][];
};
export declare const fetchActiveProposals: import("@reduxjs/toolkit").AsyncThunk<FetchActiveProposalsFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type MarkAllProposalsReadFulfilledPayload = {
    read: ProposalEntity['id'][];
};
export type MarkAllProposalsReadArgs = {
    space: string;
};
export declare const markAllProposalsRead: import("@reduxjs/toolkit").AsyncThunk<MarkAllProposalsReadFulfilledPayload, MarkAllProposalsReadArgs, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
