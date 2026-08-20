import type { FetchUserStellaSwapRewardsActionParams, FetchUserStellaSwapRewardsFulfilledPayload } from './stellaswap-user-rewards-types';
export declare const fetchUserStellaSwapRewardsAction: import("@reduxjs/toolkit").AsyncThunk<FetchUserStellaSwapRewardsFulfilledPayload, FetchUserStellaSwapRewardsActionParams, {
    state: import("../../store/types").BeefyState;
    dispatch: import("../../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
