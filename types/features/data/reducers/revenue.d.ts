export type RevenueState = {
    previousWeek: {
        yieldUsd: BigNumber | null;
        revenueUsd: BigNumber | null;
        buybackUsd: BigNumber | null;
        buybackAmount: BigNumber | null;
    };
};
export declare const initialRevenueState: RevenueState;
export declare const revenueSlice: import("@reduxjs/toolkit").Slice<RevenueState, {}, "revenue", "revenue", import("@reduxjs/toolkit").SliceSelectors<RevenueState>>;
