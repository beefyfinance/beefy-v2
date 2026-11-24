import type { BeefyState } from '../store/types.ts';

export const selectRevenueWeeks = (state: BeefyState) => state.ui.revenue.weeks;
