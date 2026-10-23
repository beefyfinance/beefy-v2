import { lazy, memo, type ReactNode, Suspense, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../../../../../components/ErrorBoundary/ErrorBoundary.tsx';
import { GraphNoData } from '../../../../../components/GraphNoData/GraphNoData.tsx';
import { formatLargeUsd } from '../../../../../helpers/format.ts';
import {
  makeUnderlyingTickFormatter,
  makeUsdTickFormatter,
} from '../../../../../helpers/graph/graph.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { getBucketParams } from '../../../../data/apis/beefy/beefy-data-api-helpers.ts';
import { selectIsRevenueSettled } from '../../../../data/selectors/data-loader/revenue.ts';
import { selectRevenueWeeks } from '../../../../data/selectors/revenue.ts';
import { selectTvlHistory } from '../../../../data/selectors/tvl-history.ts';
import { selectIsTvlHistoryYearSettled } from '../../../../data/selectors/data-loader/tvl-history.ts';
import {
  type BuybackUnit,
  type TimePointWithMa,
  type WeeklyMetric,
  weekSeries,
  withMovingAverage,
} from '../../../../data/utils/platform-stats.ts';
import { GraphLoader } from '../../../../vault/components/GraphLoader/Loader.tsx';
import type { LineTogglesState } from '../../../../vault/components/HistoricGraph/LineToggles/LineToggles.tsx';
import {
  formatMetricValue,
  METRIC_CONFIG,
  type PlatformMetric,
  useLoadTvlHistory,
} from '../Stats/usePlatformMetrics.ts';
import type { WeeklyStatChartProps } from './WeeklyStatChart.tsx';

// recharts only loads when the popup shows a chart
const WeeklyStatChart = lazy(() =>
  import('./WeeklyStatChart.tsx').then(m => ({ default: m.WeeklyStatChart }))
);

const MA_WEEKS = 4;

type PlatformChartProps = {
  metric: PlatformMetric;
  buybackUnit: BuybackUnit;
  toggles: LineTogglesState;
  compact: boolean;
};

export const PlatformChart = memo(function PlatformChart({
  metric,
  buybackUnit,
  toggles,
  compact,
}: PlatformChartProps) {
  const height = compact ? 280 : 250;
  return metric === 'tvl' ?
      <TvlChart toggles={toggles} compact={compact} height={height} />
    : <WeeklyChart
        metric={metric}
        buybackUnit={buybackUnit}
        toggles={toggles}
        compact={compact}
        height={height}
      />;
});

type ChartProps = {
  toggles: LineTogglesState;
  compact: boolean;
  height: number;
};

const TvlChart = memo(function TvlChart({ toggles, compact, height }: ChartProps) {
  const { t } = useTranslation();
  useLoadTvlHistory('1d_1Y');
  const points = useAppSelector(state => selectTvlHistory(state, '1d_1Y'));
  const settled = useAppSelector(selectIsTvlHistoryYearSettled);
  const maLabel = useMemo(() => {
    const { maPeriods, maUnit } = getBucketParams('1d_1Y');
    return `${maPeriods} ${t(maUnit)}`;
  }, [t]);

  return (
    <ChartState loading={!settled} data={points} height={height}>
      <LazyChart
        data={points}
        series="area"
        label={t(METRIC_CONFIG.tvl.shortLabel)}
        maLabel={maLabel}
        toggles={toggles}
        valueFormatter={formatLargeUsd}
        tickFormatterBuilder={makeUsdTickFormatter}
        height={height}
        compact={compact}
      />
    </ChartState>
  );
});

type WeeklyChartProps = ChartProps & {
  metric: WeeklyMetric;
  buybackUnit: BuybackUnit;
};

const WeeklyChart = memo(function WeeklyChart({
  metric,
  buybackUnit,
  toggles,
  compact,
  height,
}: WeeklyChartProps) {
  const { t } = useTranslation();
  const weeks = useAppSelector(selectRevenueWeeks);
  const settled = useAppSelector(selectIsRevenueSettled);
  const data = useMemo(
    () => withMovingAverage(weekSeries(weeks, metric, buybackUnit), MA_WEEKS),
    [weeks, metric, buybackUnit]
  );
  const isBifi = metric === 'buyback' && buybackUnit === 'bifi';
  const valueFormatter = useCallback(
    (value: number) => formatMetricValue(metric, value, buybackUnit),
    [metric, buybackUnit]
  );

  return (
    <ChartState loading={!settled} data={data} height={height}>
      <LazyChart
        data={data}
        series="bar"
        label={t(METRIC_CONFIG[metric].shortLabel)}
        maLabel={`${MA_WEEKS} ${t('weeks')}`}
        toggles={toggles}
        valueFormatter={valueFormatter}
        tickFormatterBuilder={isBifi ? makeUnderlyingTickFormatter : makeUsdTickFormatter}
        height={height}
        compact={compact}
      />
    </ChartState>
  );
});

type ChartStateProps = {
  loading: boolean;
  data: TimePointWithMa[];
  height: number;
  children: ReactNode;
};

/** An all-zero series counts as no data */
const ChartState = memo(function ChartState({ loading, data, height, children }: ChartStateProps) {
  if (loading) return <GraphLoader imgHeight={height} />;
  if (!data.some(p => p.v > 0)) return <GraphNoData reason="error" />;
  return children;
});

const LazyChart = memo(function LazyChart(props: WeeklyStatChartProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<GraphLoader imgHeight={props.height} />}>
        <WeeklyStatChart {...props} />
      </Suspense>
    </ErrorBoundary>
  );
});
