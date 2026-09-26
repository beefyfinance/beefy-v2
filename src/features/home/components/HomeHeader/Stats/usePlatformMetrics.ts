import { useEffect, useMemo } from 'react';
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
  selectShouldLoadTvlHistoryMonth,
  selectShouldLoadTvlHistoryYear,
} from '../../../../data/selectors/data-loader/tvl-history.ts';
import { selectIsRevenueSettled } from '../../../../data/selectors/data-loader/revenue.ts';
import { selectRevenueWeeks } from '../../../../data/selectors/revenue.ts';
import { selectTotalTvl } from '../../../../data/selectors/tvl.ts';
import { selectTvlHistory } from '../../../../data/selectors/tvl-history.ts';
import {
  type BuybackUnit,
  changeOverPeriod,
  WEEK_SECONDS,
  type WeeklyMetric,
  WEEKLY_METRICS,
  weekSeries,
} from '../../../../data/utils/platform-stats.ts';

export const PLATFORM_METRICS = ['tvl', ...WEEKLY_METRICS] as const;
export type PlatformMetric = (typeof PLATFORM_METRICS)[number];

type MetricConfig = {
  /** i18n key: stats bar, and popup tab from md */
  label: string;
  /** i18n key: popup tab below md, and the chart tooltip */
  shortLabel: string;
  /** i18n key of the (i) tooltip */
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

/** '-' when there's no value; a real 0 shows as such */
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

/** Loads a TVL history bucket once chain config (needed to sum active chains) is in */
export function useLoadTvlHistory(bucket: TvlHistoryBucket) {
  const dispatch = useAppDispatch();
  const isMonth = bucket === '1d_1M';
  const shouldLoad = useAppSelector(
    isMonth ? selectShouldLoadTvlHistoryMonth : selectShouldLoadTvlHistoryYear
  );
  const chainsLoaded = useAppSelector(selectIsChainConfigAvailable);

  useEffect(() => {
    if (shouldLoad && chainsLoaded) {
      dispatch(isMonth ? fetchTvlHistoryMonth() : fetchTvlHistoryYear());
    }
  }, [dispatch, isMonth, shouldLoad, chainsLoaded]);
}

export function usePlatformMetrics(
  buybackUnit: BuybackUnit
): Record<PlatformMetric, PlatformMetricData> {
  useLoadTvlHistory('1d_1M');
  const totalTvl = useAppSelector(selectTotalTvl);
  const tvlMonth = useAppSelector(state => selectTvlHistory(state, '1d_1M'));
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
