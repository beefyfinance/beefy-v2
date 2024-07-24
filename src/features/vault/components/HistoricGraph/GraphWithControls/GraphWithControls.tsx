import type { VaultEntity } from '../../../../data/entities/vault';
import type { TokenEntity } from '../../../../data/entities/token';
import React, { memo, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../../store';
import { selectHistoricalAvailableBuckets } from '../../../../data/selectors/historical';
import { GraphLoader } from '../../GraphLoader';
import { RangeSwitcher } from '../RangeSwitcher';
import { makeStyles } from '@material-ui/core';
import { Graph } from '../Graph';
import type { TimeRange } from '../utils';
import { getAvailableRanges, getDefaultTimeRange, timeRangeToBucket } from '../utils';
import type { LineTogglesState } from '../LineToggles';
import { LineToggles } from '../LineToggles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { useHistoricalStatLoader } from '../../../../data/hooks/historical';
import type { ChartStat } from '../types';
import { ErrorBoundary } from '../../../../../components/ErrorBoundary/ErrorBoundary';
import { GraphNoData } from '../../../../../components/GraphNoData/GraphNoData';

const useStyles = makeStyles(styles);

export type HistoricGraphProp = {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  stat: ChartStat;
};

export const GraphWithControls = memo<HistoricGraphProp>(function GraphWithControls({
  vaultId,
  oracleId,
  stat,
}) {
  const classes = useStyles();
  const availableBuckets = useAppSelector(state =>
    selectHistoricalAvailableBuckets(state, stat, vaultId, oracleId)
  );
  const availableRanges = useMemo(() => getAvailableRanges(availableBuckets), [availableBuckets]);
  const [range, setRange] = useState<TimeRange>(() => getDefaultTimeRange(availableRanges));
  const bucket = useMemo(() => timeRangeToBucket[range], [range]);
  const { loading, hasData, willRetry } = useHistoricalStatLoader(stat, vaultId, oracleId, bucket);
  const [lineToggles, setLineToggles] = useState<LineTogglesState>({
    average: true,
    movingAverage: true,
  });

  return (
    <div className={classes.container}>
      <div className={classes.graph}>
        {hasData ? (
          <ErrorBoundary>
            <Graph
              vaultId={vaultId}
              oracleId={oracleId}
              stat={stat}
              bucket={bucket}
              toggles={lineToggles}
            />
          </ErrorBoundary>
        ) : loading ? (
          <GraphLoader imgHeight={220} />
        ) : (
          <GraphNoData reason={willRetry ? 'error-retry' : 'wait-collect'} />
        )}
      </div>
      <div className={classes.footer}>
        {stat === 'clm' ? (
          <CowcentratedLegend />
        ) : (
          <LineToggles toggles={lineToggles} onChange={setLineToggles} />
        )}
        <RangeSwitcher range={range} availableRanges={availableRanges} onChange={setRange} />
      </div>
    </div>
  );
});

const CowcentratedLegend = memo(function CowcentratedLegend() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.legend}>
      <div className={classes.legendItem}>
        <div className={classes.line} />
        {t('Price')}
      </div>
      <div className={classes.legendItem}>
        <div className={classes.range} />
        {t('Range')}
      </div>
    </div>
  );
});
