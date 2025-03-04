import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store.ts';
import { selectHasDataToShowGraphByVaultId } from '../../../../../data/selectors/analytics.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useMemo } from 'react';
import {
  DashboardFeesGraph,
  DashboardOverviewGraph,
} from '../../../../../vault/components/PnLGraph/cowcentrated/CowcentratedPnlGraph.tsx';
import { DashboardPnLGraph } from '../../../../../vault/components/PnLGraph/standard/StandardPnLGraph.tsx';
import type { ChartTypes } from './types.ts';

export function useChartOptions(vaultId: VaultEntity['id'], address: string) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const hasAnalyticsData = useAppSelector(state =>
    selectHasDataToShowGraphByVaultId(state, vaultId, address)
  );

  return useMemo(() => {
    const typeOfCharts = isCowcentratedLikeVault(vault) ? 'cowcentrated' : vault.type;

    const PositionGraph =
      typeOfCharts === 'cowcentrated' ? DashboardOverviewGraph : DashboardPnLGraph;
    const CompoundsGraph = DashboardFeesGraph;

    const availableCharts: Array<{ value: ChartTypes; label: string }> = [];
    if (hasAnalyticsData) {
      availableCharts.push({ value: 'positionChart', label: t('Dashboard-Chart') });
      if (typeOfCharts === 'cowcentrated') {
        availableCharts.push({ value: 'positionChart', label: t('Dashboard-PositionChart') });
        if (vault.strategyTypeId === 'compounds') {
          availableCharts.push({ value: 'compoundsChart', label: t('Dashboard-CompoundsChart') });
        }
      }
    }

    return { PositionGraph, CompoundsGraph, availableCharts };
  }, [t, vault, hasAnalyticsData]);
}
