import { useCallback, useEffect, useMemo } from 'react';
import type BigNumber from 'bignumber.js';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../../../data/store/hooks.ts';
import {
  fetchTvlHistoryMonth,
  fetchTvlHistoryYear,
  type TvlHistoryBucket,
} from '../../../../data/actions/tvl-history.ts';
import { selectIsChainConfigAvailable } from '../../../../data/selectors/data-loader/config.ts';
import {
  selectHasTvlHistoryMonthFulfilled,
  selectHasTvlHistoryYearFulfilled,
  selectIsTvlHistoryMonthIdle,
  selectIsTvlHistoryMonthRejected,
  selectIsTvlHistoryYearIdle,
  selectIsTvlHistoryYearRejected,
} from '../../../../data/selectors/data-loader/tvl-history.ts';
import { selectIsRevenueSettled } from '../../../../data/selectors/data-loader/revenue.ts';
import { selectRevenueWeeks } from '../../../../data/selectors/revenue.ts';
import { selectTotalTvl } from '../../../../data/selectors/tvl.ts';
import { selectTvlHistory } from '../../../../data/selectors/tvl-history.ts';
import type { GlobalDataSelectorFn } from '../../../../data/selectors/data-loader-helpers.ts';
import {
  type BuybackUnit,
  changeOverPeriod,
  type TimePointWithMa,
  WEEK_SECONDS,
  type WeeklyMetric,
  WEEKLY_METRICS,
  weekSeries,
} from '../../../../data/utils/platform-stats.ts';

export const PLATFORM_METRICS = ['tvl', ...WEEKLY_METRICS] as const;
export type PlatformMetric = (typeof PLATFORM_METRICS)[number];

type MetricConfig = {
  label: string;
  shortLabel: string;
  tooltip?: string;
  trend: 'line' | 'bars';
};

export const METRIC_CONFIG: Record<PlatformMetric, MetricConfig> = {
  tvl: { label: 'Platform-TVL', shortLabel: 'Platform-TVL', trend: 'line' },
  yield: {
    label: 'Platform-7DaysYield',
    shortLabel: 'Graph-yield',
    tooltip: 'Platform-7DaysYield-Tooltip',
    trend: 'bars',
  },
  revenue: {
    label: 'Platform-7DaysRevenue',
    shortLabel: 'Graph-revenue',
    tooltip: 'Platform-7DaysRevenue-Tooltip',
    trend: 'bars',
  },
  buyback: {
    label: 'Platform-7DaysBuyback',
    shortLabel: 'Graph-buyback',
    tooltip: 'Platform-7DaysBuyback-Tooltip',
    trend: 'bars',
  },
};

export type PlatformMetricData = {
  /** latest value: live TVL, or the last closed week */
  value: BigNumber.Value | undefined;
  /** vs a week earlier */
  change: number | undefined;
  trend: number[];
  loading: boolean;
};

const TREND_WEEKS = 12;

export function formatMetricValue(
  metric: PlatformMetric,
  value: BigNumber.Value | undefined,
  buybackUnit: BuybackUnit
): string {
  if (value === undefined) return '-';
  return metric === 'buyback' && buybackUnit === 'bifi' ?
      formatTokenDisplayCondensed(value, 18, 6)
    : formatLargeUsd(value);
}

type LoaderSelectors = {
  selectIdle: GlobalDataSelectorFn;
  selectFulfilled: GlobalDataSelectorFn;
  selectRejected: GlobalDataSelectorFn;
};

type LoadStatus = {
  loading: boolean;
  error: boolean;
  willRetry: boolean;
};

const RETRY_AFTER_MS = 15_000;

function useLoadOnceWithRetry(
  load: () => unknown,
  { selectIdle, selectFulfilled, selectRejected }: LoaderSelectors,
  enabled: boolean = true
): LoadStatus {
  const idle = useAppSelector(selectIdle);
  const fulfilled = useAppSelector(selectFulfilled);
  const rejected = useAppSelector(selectRejected);

  useEffect(() => {
    if (!enabled || fulfilled) return;
    if (idle) {
      load();
    } else if (rejected) {
      const handle = setTimeout(load, RETRY_AFTER_MS);
      return () => clearTimeout(handle);
    }
  }, [load, enabled, idle, fulfilled, rejected]);

  const error = !fulfilled && rejected;
  return { loading: !fulfilled && !rejected, error, willRetry: error };
}

const TVL_HISTORY_LOADERS = {
  '1d_1M': {
    fetch: fetchTvlHistoryMonth,
    selectIdle: selectIsTvlHistoryMonthIdle,
    selectFulfilled: selectHasTvlHistoryMonthFulfilled,
    selectRejected: selectIsTvlHistoryMonthRejected,
  },
  '1d_1Y': {
    fetch: fetchTvlHistoryYear,
    selectIdle: selectIsTvlHistoryYearIdle,
    selectFulfilled: selectHasTvlHistoryYearFulfilled,
    selectRejected: selectIsTvlHistoryYearRejected,
  },
} as const satisfies Record<TvlHistoryBucket, LoaderSelectors & { fetch: unknown }>;

export function useTvlHistory(bucket: TvlHistoryBucket): LoadStatus & {
  data: TimePointWithMa[];
} {
  const dispatch = useAppDispatch();
  const loader = TVL_HISTORY_LOADERS[bucket];
  const chainsLoaded = useAppSelector(selectIsChainConfigAvailable);
  const data = useAppSelector(state => selectTvlHistory(state, bucket));
  const load = useCallback(() => dispatch(loader.fetch()), [dispatch, loader]);
  const status = useLoadOnceWithRetry(load, loader, chainsLoaded);
  return { data, ...status };
}

export function usePlatformMetrics(
  buybackUnit: BuybackUnit
): Record<PlatformMetric, PlatformMetricData> {
  const { data: tvlMonth } = useTvlHistory('1d_1M');
  const totalTvl = useAppSelector(selectTotalTvl);
  const weeks = useAppSelector(selectRevenueWeeks);
  const revenueSettled = useAppSelector(selectIsRevenueSettled);

  return useMemo(() => {
    const weekly = (metric: WeeklyMetric): PlatformMetricData => {
      const points = weekSeries(weeks, metric, buybackUnit);
      // a latest week with no value shows '-' rather than an older week
      const isLatest = points.length > 0 && points.at(-1)?.t === weeks.at(-1)?.t;
      return {
        value: isLatest ? points.at(-1)?.v : undefined,
        change: isLatest ? changeOverPeriod(points, WEEK_SECONDS) : undefined,
        trend: points.slice(-TREND_WEEKS).map(p => p.v),
        loading: !revenueSettled,
      };
    };

    return {
      tvl: {
        value: totalTvl,
        change: changeOverPeriod(tvlMonth, WEEK_SECONDS),
        trend: tvlMonth.map(p => p.v),
        loading: totalTvl.isZero(),
      },
      yield: weekly('yield'),
      revenue: weekly('revenue'),
      buyback: weekly('buyback'),
    };
  }, [buybackUnit, revenueSettled, totalTvl, tvlMonth, weeks]);
}
