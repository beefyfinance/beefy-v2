import React, { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectHistoricalHasAnyChart,
  selectHistoricalRangesStatus,
} from '../../../data/selectors/historical';
import { fetchHistoricalRanges } from '../../../data/actions/historical';
import { HistoricGraphs } from './HistoricGraphs';

export type HistoricGraphsLoaderProps = {
  vaultId: VaultEntity['id'];
};

export const HistoricGraphsLoader = memo<HistoricGraphsLoaderProps>(function HistoricGraphsLoader({
  vaultId,
}) {
  const dispatch = useAppDispatch();
  const rangesStatus = useAppSelector(state => selectHistoricalRangesStatus(state, vaultId));
  const hasAnyChart = useAppSelector(state => selectHistoricalHasAnyChart(state, vaultId));

  useEffect(() => {
    if (rangesStatus === 'idle') {
      dispatch(fetchHistoricalRanges({ vaultId }));
    }
  }, [dispatch, rangesStatus, vaultId]);

  if (!hasAnyChart) {
    return null;
  }

  return <HistoricGraphs vaultId={vaultId} />;
});
