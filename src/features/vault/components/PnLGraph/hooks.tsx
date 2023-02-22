import { useState, useEffect } from 'react';
import { getAnalyticsApi } from '../../../data/apis/instances';
import { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import {
  selectLastVaultDepositStart,
  selectUserDepositedTimelineByVaultId,
} from '../../../data/selectors/analytics';
import { getInvestorTimeserie, PriceTsRow } from '../../../../helpers/timeserie';
import { isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash';
import { TimeBucketType } from '../../../data/apis/analytics/analytics-types';

interface ChardataType {
  data: PriceTsRow[];
  minUsd: number;
  maxUsd: number;
  minUnderlying: number;
  maxUnderlying: number;
  firstDate: Date;
  lastDate: Date;
}

export const initialChartDataValue = {
  data: [],
  minUsd: 0,
  maxUsd: 0,
  minUnderlying: 0,
  maxUnderlying: 0,
  firstDate: new Date(),
  lastDate: new Date(),
};

export const usePnLChartData = (
  timebucket: TimeBucketType,
  productKey: string,
  vaultId: VaultEntity['id']
) => {
  const [chartData, setChartData] = useState<ChardataType>(initialChartDataValue);

  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId)
  );

  const vaultLastDeposit = useAppSelector(state => selectLastVaultDepositStart(state, vaultId));

  useEffect(() => {
    const fetchData = async () => {
      const api = getAnalyticsApi();

      const [shares, underlying] = await Promise.all([
        api.getVaultPrices(productKey, 'share_to_underlying', timebucket),
        api.getVaultPrices(productKey, 'underlying_to_usd', timebucket),
      ]);

      const filteredShares = shares.filter(price => isAfter(price.date, vaultLastDeposit));

      const filteredUnderlying = underlying.filter(price => isAfter(price.date, vaultLastDeposit));

      const chartData = getInvestorTimeserie(
        timebucket,
        vaultTimeline,
        filteredShares,
        filteredUnderlying,
        vaultLastDeposit
      );

      if (chartData) {
        const minUsd = chartData
          ? minBy(chartData, row => row.usdBalance.toNumber()).usdBalance?.toNumber()
          : 0;
        const maxUsd = chartData
          ? maxBy(chartData, row => row.usdBalance.toNumber()).usdBalance?.toNumber()
          : 0;

        const minUnderlying = minBy(chartData, row =>
          row.underlyingBalance.toNumber()
        ).underlyingBalance.toNumber();
        const maxUnderlying = maxBy(chartData, row =>
          row.underlyingBalance.toNumber()
        ).underlyingBalance.toNumber();

        const firstDate = chartData[0].datetime;
        const lastDate = chartData[chartData.length - 1].datetime;

        setChartData({
          data: chartData,
          minUnderlying,
          maxUnderlying,
          minUsd,
          maxUsd,
          firstDate,
          lastDate,
        });
      }
    };

    fetchData();
  }, [productKey, vaultTimeline, vaultLastDeposit, timebucket]);

  return chartData;
};
