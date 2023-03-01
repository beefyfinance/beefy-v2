import { useState, useEffect, useMemo } from 'react';
import { getAnalyticsApi } from '../../../data/apis/instances';
import { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import {
  selectLastVaultDepositStart,
  selectUserDepositedTimelineByVaultId,
} from '../../../data/selectors/analytics';
import { getInvestorTimeserie, PriceTsRow } from '../../../../helpers/timeserie';
import { eachDayOfInterval, isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash';
import { TimeBucketType } from '../../../data/apis/analytics/analytics-types';
import { selectVaultById, selectVaultPricePerFullShare } from '../../../data/selectors/vaults';
import {
  selectDepositTokenByVaultId,
  selectTokenPriceByAddress,
} from '../../../data/selectors/tokens';
import { selectUserBalanceOfTokensIncludingBoosts } from '../../../data/selectors/balance';

interface ChardataType {
  data: PriceTsRow[];
  minUsd: number;
  maxUsd: number;
  minUnderlying: number;
  maxUnderlying: number;
  loading: boolean;
}

export const initialChartDataValue = {
  data: [],
  minUsd: 0,
  maxUsd: 0,
  minUnderlying: 0,
  maxUnderlying: 0,
  loading: true,
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

  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const currentPpfs = useAppSelector(state =>
    selectVaultPricePerFullShare(state, vaultId)
  ).shiftedBy(18 - depositToken.decimals);
  const currentOraclePrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const currentMooTokenBalance = useAppSelector(state =>
    selectUserBalanceOfTokensIncludingBoosts(
      state,
      vault.id,
      vault.chainId,
      vault.earnContractAddress
    )
  );

  const vaultLastDeposit = useAppSelector(state => selectLastVaultDepositStart(state, vaultId));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = getAnalyticsApi();
        const [shares, underlying] = await Promise.all([
          api.getVaultPrices(productKey, 'share_to_underlying', timebucket),
          api.getVaultPrices(productKey, 'underlying_to_usd', timebucket),
        ]);

        const filteredShares = shares.filter(price => isAfter(price.date, vaultLastDeposit));

        const filteredUnderlying = underlying.filter(price =>
          isAfter(price.date, vaultLastDeposit)
        );

        const chartData = getInvestorTimeserie(
          timebucket,
          vaultTimeline,
          filteredShares,
          filteredUnderlying,
          vaultLastDeposit,
          currentPpfs,
          currentOraclePrice.toNumber(),
          currentMooTokenBalance
        );

        if (chartData.length > 0) {
          const minUsd = chartData ? minBy(chartData, row => row.usdBalance).usdBalance : 0;
          const maxUsd = chartData ? maxBy(chartData, row => row.usdBalance).usdBalance : 0;

          const minUnderlying = minBy(chartData, row => row.underlyingBalance).underlyingBalance;
          const maxUnderlying = maxBy(chartData, row => row.underlyingBalance).underlyingBalance;

          setChartData({
            data: chartData,
            minUnderlying,
            maxUnderlying,
            minUsd,
            maxUsd,
            loading: false,
          });
        } else {
          setChartData({
            data: [],
            minUnderlying: 0,
            maxUnderlying: 0,
            minUsd: 0,
            maxUsd: 0,
            loading: true,
          });
        }
      } catch (error) {
        setChartData({
          data: [],
          minUnderlying: 0,
          maxUnderlying: 0,
          minUsd: 0,
          maxUsd: 0,
          loading: true,
        });
      }
    };
    setChartData({ ...chartData, loading: true });
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timebucket]);

  return chartData;
};

export const useVaultPeriods = (vaultId: VaultEntity['id']) => {
  const vaultDepositDate = useAppSelector(state => selectLastVaultDepositStart(state, vaultId));
  const currentDate = new Date();

  const result = eachDayOfInterval({
    start: vaultDepositDate,
    end: currentDate,
  });

  const dates = useMemo(() => {
    if (result.length > 30) return ['1D', '1W', '1M', 'ALL'];
    if (result.length > 7) return ['1D', '1W', 'ALL'];
    if (result.length > 1) return ['1D', 'ALL'];
    return ['1D'];
  }, [result.length]);

  return dates;
};
