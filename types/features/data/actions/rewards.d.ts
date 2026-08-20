import type { BeefyOffChainRewardsCampaign } from '../apis/beefy/beefy-api-types';
export type FetchOffChainRewardsActionParams = void;
export type FetchOffChainRewardsFulfilledPayload = {
    campaigns: BeefyOffChainRewardsCampaign[];
};
export declare const fetchOffChainCampaignsAction: import("@reduxjs/toolkit").AsyncThunk<FetchOffChainRewardsFulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
