import { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { useAppDispatch, useAppSelector } from '../../../../store.ts';
import {
  selectHistoricalHasAnyChart,
  selectHistoricalRangesStatus,
} from '../../../data/selectors/historical.ts';
import { fetchHistoricalRanges } from '../../../data/actions/historical.ts';
import { HistoricGraphs } from './HistoricGraphs.tsx';
import { fetchAllCurrentCowcentratedRanges } from '../../../data/actions/tokens.ts';
import { selectShouldLoadAllCurrentCowcentratedRanges } from '../../../data/selectors/data-loader.ts';

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
