import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { selectHasDataToShowGraphByVaultId } from '../../../../../data/selectors/analytics';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { useMemo } from 'react';
import {
  DashboardFeesGraph,
  DashboardOverviewGraph,
} from '../../../../../vault/components/PnLGraph/cowcentrated';
import { DashboardPnLGraph } from '../../../../../vault/components/PnLGraph/standard/StandardPnLGraph';
import type { ChartTypes } from './types';
import type { OptionalRecord } from '../../../../../data/utils/types-utils';

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

    const availableCharts: OptionalRecord<ChartTypes, string> = {};
    if (hasAnalyticsData) {
      availableCharts['positionChart'] = t('Dashboard-Chart');
      if (typeOfCharts === 'cowcentrated') {
        availableCharts['positionChart'] = t('Dashboard-PositionChart');
        if (vault.strategyTypeId === 'compounds') {
          availableCharts['compoundsChart'] = t('Dashboard-CompoundsChart');
        }
      }
    }

    return { PositionGraph, CompoundsGraph, availableCharts };
  }, [t, vault, hasAnalyticsData]);
}
