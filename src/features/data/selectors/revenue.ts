import type { BeefyState } from '../store/types.ts';

export const selectPreviousWeekRevenueStats = (state: BeefyState) => state.ui.revenue.previousWeek;
