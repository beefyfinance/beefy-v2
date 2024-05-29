import { useMemo } from 'react';
import { useAppSelector } from '../../../../../../store';
import type { TimeBucketType } from '../../../../../data/apis/analytics/analytics-types';
import type { VaultEntity } from '../../../../../data/entities/vault';
import {
  selectLastVaultDepositStart,
  selectUserDepositedTimelineByVaultId,
} from '../../../../../data/selectors/analytics';
import { selectCowcentratedVaultDepositTokensWithPrices } from '../../../../../data/selectors/tokens';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectWalletAddress } from '../../../../../data/selectors/wallet';
import { eachDayOfInterval, isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash';
import { getClmInvestorFeesTimeserie } from '../../../../../../helpers/timeserie';
import type { CLMTimelineAnalyticsEntity } from '../../../../../data/entities/analytics';
import { selectClmHarvestsByVaultAddress } from '../../../../../data/selectors/clm-harvests';

// Same object reference for empty chart data
export const NO_CHART_DATA = { data: [], minUsd: 0, maxUsd: 0 };

export const useFeesChartData = (
  timebucket: TimeBucketType,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));

  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress)
  );
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const vaultLastDeposit = useAppSelector(state =>
    selectLastVaultDepositStart(state, vaultId, walletAddress)
  );

  const harvests = useAppSelector(state =>
    selectClmHarvestsByVaultAddress(state, vault.chainId, vault.earnContractAddress)
  );

  const { token0, token1 } = useAppSelector(state =>
    selectCowcentratedVaultDepositTokensWithPrices(state, vaultId)
  );

  const isLoading = useMemo(() => {
    return !harvests;
  }, [harvests]);

  const chartData = useMemo(() => {
    if (harvests && harvests!.length > 0) {
      const filteredHarvests = harvests.filter(harvest =>
        isAfter(harvest.timestamp, vaultLastDeposit)
      );

      const data = getClmInvestorFeesTimeserie(
        timebucket,
        vaultTimeline as CLMTimelineAnalyticsEntity[],
        filteredHarvests,
        vaultLastDeposit,
        token0.price,
        token1.price
      );

      const minV0Usd = minBy(data, 'v0')?.v0 || 0;
      const minV1Usd = minBy(data, 'v1')?.v1 || 0;

      const maxV0Usd = maxBy(data, 'v0')?.v0 || 0;
      const maxV1Usd = maxBy(data, 'v1')?.v1 || 0;

      const minUsd = minV0Usd < minV1Usd ? minV0Usd : minV1Usd;
      const maxUsd = maxV0Usd > maxV1Usd ? maxV0Usd : maxV1Usd;

      if (data && data.length > 0) {
        return { data, minUsd, maxUsd };
      }
    }

    // This save us from re-rendering when data is loading
    // We need to make sure this object is not modified elsewhere
    return NO_CHART_DATA;
  }, [harvests, timebucket, token0.price, token1.price, vaultLastDeposit, vaultTimeline]);

  return { chartData, isLoading };
};

export const useVaultPeriods = (vaultId: VaultEntity['id'], address?: string) => {
  const vaultDepositDate = useAppSelector(state =>
    selectLastVaultDepositStart(state, vaultId, address)
  );
  const currentDate = new Date();

  const result = eachDayOfInterval({
    start: vaultDepositDate,
    end: currentDate,
  });

  return useMemo(() => {
    if (result.length > 30) return ['1D', '1W', '1M', 'ALL'];
    if (result.length > 7) return ['1D', '1W', 'ALL'];
    if (result.length > 1) return ['1D', 'ALL'];
    if (result.length === 1) return ['1D'];
    return [];
  }, [result.length]);
};
