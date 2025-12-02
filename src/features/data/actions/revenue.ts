import { getBeefyDataApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number.ts';

export interface RevenueStatsPayload {
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

    // Use index 0, but fallback to index 1 if any values are null
    let stat = response[0];
    if (
      !stat ||
      stat.harvests_total_usd === null ||
      stat.fees_platform_usd === null ||
      stat.buyback_total_usd === null
    ) {
      stat = response[1] || response[0];
    }

    const data = {
      yieldUsd: stat?.harvests_total_usd ? new BigNumber(stat.harvests_total_usd) : BIG_ZERO,
      revenueUsd: stat?.fees_platform_usd ? new BigNumber(stat.fees_platform_usd) : BIG_ZERO,
      buybackUsd: stat?.buyback_total_usd ? new BigNumber(stat.buyback_total_usd) : BIG_ZERO,
      buybackAmount: stat?.buyback_amount ? new BigNumber(stat.buyback_amount) : BIG_ZERO,
    };

    return { data };
  }
);
