import { useState, useEffect } from 'react';
import { getAnalyticsApi } from '../../../data/apis/instances';
import { useTranslation } from 'react-i18next';
import { TimeBucketType } from '../../../data/apis/analytics/analytics-types';

const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_1Y'];

export const useChartData = (stat, productKey: string) => {
  const [chartData, setChartData] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const api = getAnalyticsApi();

      const [underlying, shares] = await Promise.all([
        api.getVaultPrices(productKey, 'underlying_to_usd', TIME_BUCKET[stat]),
        api.getVaultPrices(productKey, 'share_to_underlying', TIME_BUCKET[stat]),
      ]);

      console.log('under', underlying);
      console.log('shares', shares);

      setChartData([]);
    };

    fetchData();
  }, [stat, t, productKey]);

  return [chartData];
};
