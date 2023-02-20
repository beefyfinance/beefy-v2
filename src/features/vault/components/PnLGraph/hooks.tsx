import { useState, useEffect } from 'react';
import { getAnalyticsApi } from '../../../data/apis/instances';
import { useTranslation } from 'react-i18next';
import { TimeBucketType } from '../../../data/apis/analytics/analytics-types';
import { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectUserDepositedTimelineByVaultId } from '../../../data/selectors/analytics';
import { getInvestorTimeserie } from '../../../../helpers/timeserie';

const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_1Y'];

export const usePnLChartData = (stat, productKey: string, vaultId: VaultEntity['id']) => {
  const [chartData, setChartData] = useState([]);
  const { t } = useTranslation();

  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId)
  );

  useEffect(() => {
    const fetchData = async () => {
      const api = getAnalyticsApi();

      const [shares, underlying] = await Promise.all([
        api.getVaultPrices(productKey, 'share_to_underlying', TIME_BUCKET[stat]),
        api.getVaultPrices(productKey, 'underlying_to_usd', TIME_BUCKET[stat]),
      ]);

      const chartData = getInvestorTimeserie(TIME_BUCKET[stat], vaultTimeline, shares, underlying);

      setChartData(chartData);
    };

    fetchData();
  }, [stat, t, productKey, vaultTimeline]);

  return chartData;
};
