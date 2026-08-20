import BigNumber from 'bignumber.js';
export interface RevenueStatsPayload {
    week?: number;
    data: {
        yieldUsd: BigNumber | null;
        revenueUsd: BigNumber | null;
        buybackUsd: BigNumber | null;
        buybackAmount: BigNumber | null;
    };
}
export declare const fetchWeeklyRevenueStats: import("@reduxjs/toolkit").AsyncThunk<RevenueStatsPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
