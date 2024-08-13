import { memo, useEffect } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectHistoricalHasAnyChart,
  selectHistoricalRangesStatus,
} from '../../../data/selectors/historical';
import { fetchHistoricalRanges } from '../../../data/actions/historical';
import { HistoricGraphs } from './HistoricGraphs';
import { fetchAllCurrentCowcentratedRanges } from '../../../data/actions/tokens';
import { selectShouldLoadAllCurrentCowcentratedRanges } from '../../../data/selectors/data-loader';

export type HistoricGraphsLoaderProps = {
  vaultId: VaultEntity['id'];
};

export const HistoricGraphsLoader = memo<HistoricGraphsLoaderProps>(function HistoricGraphsLoader({
  vaultId,
}) {
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
