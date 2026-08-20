import type { BeefyState } from '../store/types';
export declare const selectPreviousWeekRevenueStats: (state: BeefyState) => {
    yieldUsd: BigNumber | null;
    revenueUsd: BigNumber | null;
    buybackUsd: BigNumber | null;
    buybackAmount: BigNumber | null;
};
