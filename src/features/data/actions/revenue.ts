import { getBeefyDataApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { getUnixNow } from '../../../helpers/date.ts';

export interface RevenueStatsPayload {
  week?: number;
  data: {
    yieldUsd: BigNumber;
    revenueUsd: BigNumber;
    buybackUsd: BigNumber;
    buybackAmount: BigNumber;
  };
}

export const fetchWeeklyRevenueStats = createAppAsyncThunk<RevenueStatsPayload>(
  'revenue/fetchWeeklyRevenueStats',
  async () => {
    const api = await getBeefyDataApi();
    const response = await api.getRevenueStatsByPeriod('weekly');
    const oneWeekAgo = getUnixNow() - 7 * 24 * 60 * 60;
    const stat = response.find(({ t }) => t <= oneWeekAgo);

    const data = {
      yieldUsd: stat?.harvests_total_usd ? new BigNumber(stat.harvests_total_usd) : BIG_ZERO,
      revenueUsd: stat?.fees_platform_usd ? new BigNumber(stat.fees_platform_usd) : BIG_ZERO,
      buybackUsd: stat?.buyback_total_usd ? new BigNumber(stat.buyback_total_usd) : BIG_ZERO,
      buybackAmount: stat?.buyback_amount ? new BigNumber(stat.buyback_amount) : BIG_ZERO,
    };

    return { week: stat?.t, data };
  }
);
