import { useMemo } from 'react';
import { useAppSelector } from '../../../../../../store';
import type { TimeBucketType } from '../../../../../data/apis/analytics/analytics-types';
import type { VaultEntity } from '../../../../../data/entities/vault';
import {
  selectUserClmHarvestTimelineByVaultId,
  selectUserFirstDepositDateByVaultId,
} from '../../../../../data/selectors/analytics';
import { selectCowcentratedVaultDepositTokensWithPrices } from '../../../../../data/selectors/tokens';
import { selectWalletAddress } from '../../../../../data/selectors/wallet';
import { maxBy, minBy } from 'lodash';
import { getClmInvestorFeesTimeserie } from '../../../../../../helpers/timeserie';
import { eachDayOfInterval } from 'date-fns';

// Same object reference for empty chart data
export const NO_CHART_DATA = { data: [], minUsd: 0, maxUsd: 0 };

export const useFeesChartData = (
  timebucket: TimeBucketType,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const userHarvestTimeline = useAppSelector(state =>
    selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress)
  );
  const isLoading = !userHarvestTimeline;
  const { token0, token1 } = useAppSelector(state =>
    selectCowcentratedVaultDepositTokensWithPrices(state, vaultId)
  );

  const chartData = useMemo(() => {
    if (userHarvestTimeline && userHarvestTimeline.harvests.length > 0) {
      const data = getClmInvestorFeesTimeserie(
        timebucket,
        userHarvestTimeline,
        token0.price,
        token1.price
      );

      if (data && data.length > 0) {
        const minV0Usd = minBy(data, 'v0')?.v0 || 0;
        const minV1Usd = minBy(data, 'v1')?.v1 || 0;

        const maxV0Usd = maxBy(data, 'v0')?.v0 || 0;
        const maxV1Usd = maxBy(data, 'v1')?.v1 || 0;

        const minUsd = minV0Usd < minV1Usd ? minV0Usd : minV1Usd;
        const maxUsd = maxV0Usd > maxV1Usd ? maxV0Usd : maxV1Usd;

        return { data, minUsd, maxUsd };
      }
    }

    // This save us from re-rendering when data is loading
    // We need to make sure this object is not modified elsewhere
    return NO_CHART_DATA;
  }, [userHarvestTimeline, timebucket, token0.price, token1.price]);

  return { chartData, isLoading };
};

export const useVaultPeriodsFeesGraph = (vaultId: VaultEntity['id'], address?: string) => {
  const vaultDepositDate = useAppSelector(state =>
    selectUserFirstDepositDateByVaultId(state, vaultId, address)
  );
  const currentDate = new Date();

  const result = eachDayOfInterval({
    start: vaultDepositDate || currentDate,
    end: currentDate,
  });

  return useMemo(() => {
    if (result.length > 30) return ['1W', '1M', 'ALL'];
    if (result.length > 7) return ['1W', 'ALL'];
    if (result.length > 1) return ['ALL'];
    if (result.length === 1) return ['ALL'];
    return [];
  }, [result.length]);
};
