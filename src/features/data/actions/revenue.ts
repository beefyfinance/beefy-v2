import { getBeefyDataApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { getUnixNow } from '../../../helpers/date.ts';
import { parseCompleteWeeks, type RevenueWeek } from '../utils/platform-stats.ts';

export interface RevenueStatsPayload {
  weeks: RevenueWeek[];
}

export const fetchWeeklyRevenueStats = createAppAsyncThunk<RevenueStatsPayload>(
  'revenue/fetchWeeklyRevenueStats',
  async () => {
    const api = await getBeefyDataApi();
    const response = await api.getRevenueStatsByPeriod('weekly');
    return { weeks: parseCompleteWeeks(response, getUnixNow()) };
  }
);
