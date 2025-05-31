import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  selectClmAutocompoundedFeesEnabledByVaultId,
  selectHasDataToShowGraphByVaultId,
} from '../../../../../data/selectors/analytics.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
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
  const typeOfCharts = isCowcentratedLikeVault(vault) ? 'cowcentrated' : vault.type;
  const showCompounds = useAppSelector(
    state =>
      typeOfCharts === 'cowcentrated' && selectClmAutocompoundedFeesEnabledByVaultId(state, vaultId)
  );

  return useMemo(() => {
    const PositionGraph =
      typeOfCharts === 'cowcentrated' ? DashboardOverviewGraph : DashboardPnLGraph;
    const CompoundsGraph = DashboardFeesGraph;

    const availableCharts: Array<{ value: ChartTypes; label: string }> = [];
    if (hasAnalyticsData) {
      if (typeOfCharts === 'cowcentrated') {
        availableCharts.push({ value: 'positionChart', label: t('Dashboard-PositionChart') });
        if (showCompounds) {
          availableCharts.push({ value: 'compoundsChart', label: t('Dashboard-CompoundsChart') });
        }
      } else {
        availableCharts.push({ value: 'positionChart', label: t('Dashboard-Chart') });
      }
    }

    return { PositionGraph, CompoundsGraph, availableCharts };
  }, [t, typeOfCharts, showCompounds, hasAnalyticsData]);
}
