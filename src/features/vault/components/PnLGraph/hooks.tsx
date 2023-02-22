import { useState, useEffect } from 'react';
import { getAnalyticsApi } from '../../../data/apis/instances';
import { useTranslation } from 'react-i18next';
import { TimeBucketType } from '../../../data/apis/analytics/analytics-types';
import { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import {
  selectLastVaultDepositStart,
  selectUserDepositedTimelineByVaultId,
} from '../../../data/selectors/analytics';
import { getInvestorTimeserie, PriceTsRow } from '../../../../helpers/timeserie';
import { isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash';

const TIME_BUCKET: TimeBucketType[] = ['1h_1d', '1h_1w', '1d_1M', '1d_1Y'];

interface ChardataType {
  data: PriceTsRow[];
  minUsd: number;
  maxUsd: number;
  minUnderlying: number;
  maxUnderlying: number;
}

export const usePnLChartData = (stat, productKey: string, vaultId: VaultEntity['id']) => {
  const [chartData, setChartData] = useState<ChardataType>({
    data: [],
    minUsd: 0,
    maxUsd: 0,
    minUnderlying: 0,
    maxUnderlying: 0,
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
        api.getVaultPrices(productKey, 'share_to_underlying', TIME_BUCKET[stat]),
        api.getVaultPrices(productKey, 'underlying_to_usd', TIME_BUCKET[stat]),
      ]);

      const filteredShares = shares.filter(price => isAfter(price.date, vaultLastDeposit));

      const filteredUnderlying = underlying.filter(price => isAfter(price.date, vaultLastDeposit));

      const chartData = getInvestorTimeserie(
        TIME_BUCKET[stat],
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

      setChartData({ data: chartData, minUnderlying, maxUnderlying, minUsd, maxUsd });
    };

    fetchData();
  }, [stat, t, productKey, vaultTimeline, vaultLastDeposit]);

  return chartData;
};
