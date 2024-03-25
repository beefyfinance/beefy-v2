import React, { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectHistoricalHasAnyChart,
  selectHistoricalHasCowcentratedRanges,
  selectHistoricalRangesStatus,
} from '../../../data/selectors/historical';
import {
  fetchCowcentratedVaultData,
  fetchHistoricalRanges,
} from '../../../data/actions/historical';
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
  const hasCowcentratedData = useAppSelector(state =>
    selectHistoricalHasCowcentratedRanges(state, vaultId)
  );

  useEffect(() => {
    if (rangesStatus === 'idle') {
      dispatch(fetchHistoricalRanges({ vaultId }));
    }
    if (!hasCowcentratedData) {
      dispatch(fetchCowcentratedVaultData());
    }
  }, [dispatch, hasCowcentratedData, rangesStatus, vaultId]);

  if (!hasAnyChart) {
    return null;
  }

  return <HistoricGraphs vaultId={vaultId} />;
});
