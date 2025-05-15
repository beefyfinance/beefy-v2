import { differenceInHours } from 'date-fns';
import { maxBy, minBy } from 'lodash-es';
import { useMemo } from 'react';
import { getClmInvestorFeesTimeSeries } from '../../../../../../../helpers/graph/timeseries.ts';
import type { GraphBucket } from '../../../../../../../helpers/graph/types.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../../data/entities/vault.ts';
import {
  selectUserClmHarvestTimelineByVaultId,
  selectUserFirstDepositDateByVaultId,
} from '../../../../../../data/selectors/analytics.ts';
import { selectWalletAddress } from '../../../../../../data/selectors/wallet.ts';

// Same object reference for empty chart data
export const NO_CHART_DATA = { data: [], tokens: [], minUsd: 0, maxUsd: 0 };

export const useFeesChartData = (
  timeBucket: GraphBucket,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const userHarvestTimeline = useAppSelector(state =>
    selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress)
  );
  const firstDepositDate = useAppSelector(state =>
    selectUserFirstDepositDateByVaultId(state, vaultId, walletAddress)
  );
  const isLoading = !userHarvestTimeline;

  const chartData = useMemo(() => {
    if (userHarvestTimeline) {
      const data = getClmInvestorFeesTimeSeries(
        timeBucket,
        userHarvestTimeline,
        firstDepositDate || new Date()
      );

      if (data && data.length > 0) {
        const tokens = userHarvestTimeline.tokens;
        const mins = tokens.map((_, i) => minBy(data, d => d.values[i])?.values[i] || 0);
        const maxes = tokens.map((_, i) => maxBy(data, d => d.values[i])?.values[i] || 0);

        const minUsd = Math.min(...mins);
        const maxUsd = Math.max(...maxes);

        return { data, tokens, minUsd, maxUsd };
      }
    }

    // This save us from re-rendering when data is loading
    // We need to make sure this object is not modified elsewhere
    return NO_CHART_DATA;
  }, [userHarvestTimeline, timeBucket, firstDepositDate]);

  return { chartData, isLoading };
};

/**
 * The indexes of the array returned are used to index FEES_TIME_BUCKET
 */
export const useVaultPeriodsFeesGraph = (
  vaultId: VaultEntity['id'],
  address: string,
  minHours: number = 4
): string[] => {
  const vaultDepositDate = useAppSelector(state =>
    selectUserFirstDepositDateByVaultId(state, vaultId, address)
  );
  const harvestTimeline = useAppSelector(state =>
    selectUserClmHarvestTimelineByVaultId(state, vaultId, address)
  );

  return useMemo(() => {
    if (
      vaultDepositDate === undefined ||
      harvestTimeline === undefined ||
      harvestTimeline.harvests.length === 0
    ) {
      return [];
    }

    const now = new Date();
    const fullHours = differenceInHours(now, vaultDepositDate);
    const fractionalDays = fullHours / 24;

    if (fractionalDays > 366) return ['1W', '1M', '1Y', 'ALL'];
    if (fractionalDays > 30) return ['1W', '1M', 'ALL'];
    if (fractionalDays > 7) return ['1W', 'ALL'];
    if (fractionalDays > 1) return ['ALL'];

    // smallest bucket is 1h, so wait until we have at least 4 hours to show on the graph
    if (fullHours >= minHours) return ['ALL'];

    return [];
  }, [vaultDepositDate, harvestTimeline, minHours]);
};
