import { useState, useEffect } from 'react';
import { getAnalyticsApi } from '../../../data/apis/instances';
import { useTranslation } from 'react-i18next';
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

export const usePnLChartData = (
  timebucket: TimeBucketType,
  productKey: string,
  vaultId: VaultEntity['id']
) => {
  const [chartData, setChartData] = useState<ChardataType>({
    data: [],
    minUsd: 0,
    maxUsd: 0,
    minUnderlying: 0,
    maxUnderlying: 0,
    firstDate: new Date(),
    lastDate: new Date(),
  });
  const { t } = useTranslation();

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

      // console.log('VaultTimeline', vaultTimeline);

      // console.log(
      //   'max Underlying',
      //   maxBy(chartData, row => row.underlyingBalance.toNumber()).underlyingBalance.toFixed(8),
      //   maxBy(chartData, row => row.underlyingBalance.toNumber()).underlyingBalance.toNumber() * 1.1
      // );
      // console.log(
      //   'min Underlying',
      //   minBy(chartData, row => row.underlyingBalance.toNumber()).underlyingBalance.toFixed(8),
      //   minBy(chartData, row => row.underlyingBalance.toNumber()).underlyingBalance.toNumber() * 0.9
      // );

      // console.log(
      //   'max Shares',
      //   maxBy(chartData, row => row.shareBalance.toNumber()).shareBalance.toFixed(8),
      //   maxBy(chartData, row => row.shareBalance.toNumber()).shareBalance.toNumber() * 1.1
      // );
      // console.log(
      //   'min Shares',
      //   minBy(chartData, row => row.shareBalance.toNumber()).shareBalance.toFixed(8),
      //   minBy(chartData, row => row.shareBalance.toNumber()).shareBalance.toNumber() * 0.9
      // );

      // console.log(
      //   'max USD',
      //   maxBy(chartData, row => row.usdBalance.toNumber()).usdBalance.toFixed(8),
      //   maxBy(chartData, row => row.usdBalance.toNumber()).usdBalance.toNumber() * 1.1
      // );
      // console.log(
      //   'min USD',
      //   minBy(chartData, row => row.usdBalance.toNumber()).usdBalance.toFixed(8),
      //   minBy(chartData, row => row.usdBalance.toNumber()).usdBalance.toNumber() * 0.9
      // );

      const minUsd = minBy(chartData, row => row.usdBalance.toNumber()).usdBalance.toNumber();
      const maxUsd = maxBy(chartData, row => row.usdBalance.toNumber()).usdBalance.toNumber();

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
    };

    fetchData();
  }, [t, productKey, vaultTimeline, vaultLastDeposit, timebucket]);

  return chartData;
};
