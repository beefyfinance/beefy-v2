import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import { fetchHistoricalRanges } from '../../../data/actions/historical.ts';
import { fetchAllCurrentCowcentratedRanges } from '../../../data/actions/tokens.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectHistoricalHasAnyChart,
  selectHistoricalRangesStatus,
  selectShouldLoadAllCurrentCowcentratedRanges,
} from '../../../data/selectors/historical.ts';
import { HistoricGraphs } from './HistoricGraphs.tsx';

export type HistoricGraphsLoaderProps = {
  vaultId: VaultEntity['id'];
};

export const HistoricGraphsLoader = memo(function HistoricGraphsLoader({
  vaultId,
}: HistoricGraphsLoaderProps) {
  const dispatch = useAppDispatch();
  const rangesStatus = useAppSelector(state => selectHistoricalRangesStatus(state, vaultId));
  const hasAnyChart = useAppSelector(state => selectHistoricalHasAnyChart(state, vaultId));
  const shouldLoadAllCurrentCowcentratedRanges = useAppSelector(state =>
    selectShouldLoadAllCurrentCowcentratedRanges(state)
  );

  useEffect(() => {
    if (rangesStatus === 'idle') {
      dispatch(fetchHistoricalRanges({ vaultId }));
    }
    if (shouldLoadAllCurrentCowcentratedRanges) {
      dispatch(fetchAllCurrentCowcentratedRanges());
    }
  }, [dispatch, shouldLoadAllCurrentCowcentratedRanges, rangesStatus, vaultId]);

  if (!hasAnyChart) {
    return null;
  }

  return <HistoricGraphs vaultId={vaultId} />;
});
