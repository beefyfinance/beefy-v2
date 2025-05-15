import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../../../../../components/ErrorBoundary/ErrorBoundary.tsx';
import { GraphNoData } from '../../../../../components/GraphNoData/GraphNoData.tsx';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import type { TokenEntity } from '../../../../data/entities/token.ts';
import type { VaultEntity } from '../../../../data/entities/vault.ts';
import { useHistoricalStatLoader } from '../../../../data/hooks/historical.ts';
import { selectHistoricalAvailableBuckets } from '../../../../data/selectors/historical.ts';
import { GraphLoader } from '../../GraphLoader/Loader.tsx';
import { Graph } from '../Graph/Graph.tsx';
import type { LineTogglesState } from '../LineToggles/LineToggles.tsx';
import { LineToggles } from '../LineToggles/LineToggles.tsx';
import { RangeSwitcher } from '../RangeSwitcher/RangeSwitcher.tsx';
import type { ChartStat } from '../types.ts';
import type { TimeRange } from '../utils.ts';
import { getAvailableRanges, getDefaultTimeRange, timeRangeToBucket } from '../utils.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type HistoricGraphProp = {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  stat: ChartStat;
  inverted: boolean;
};

export const GraphWithControls = memo(function GraphWithControls({
  vaultId,
  oracleId,
  stat,
  inverted,
}: HistoricGraphProp) {
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
        {hasData ?
          <ErrorBoundary>
            <Graph
              vaultId={vaultId}
              oracleId={oracleId}
              stat={stat}
              bucket={bucket}
              toggles={lineToggles}
              inverted={inverted}
            />
          </ErrorBoundary>
        : loading ?
          <GraphLoader imgHeight={220} />
        : <GraphNoData reason={willRetry ? 'error-retry' : 'wait-collect'} />}
      </div>
      <div className={classes.footer}>
        {stat === 'clm' ?
          <CowcentratedLegend />
        : <LineToggles toggles={lineToggles} onChange={setLineToggles} />}
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
