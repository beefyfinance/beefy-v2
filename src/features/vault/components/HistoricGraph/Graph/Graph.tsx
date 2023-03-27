import React, { memo, useCallback, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { VaultEntity } from '../../../../data/entities/vault';
import { TokenEntity } from '../../../../data/entities/token';
import { ChartStat } from '../../../../data/reducers/historical-types';
import { TimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import { format, fromUnixTime } from 'date-fns';
import { XAxisTick } from '../../../../../components/XAxisTick';
import { getXInterval, mapRangeToTicks } from '../../../../../helpers/graph';
import { formatPercent, formatUsd } from '../../../../../helpers/format';
import { LineTogglesState } from '../LineToggles';
import { TooltipContent } from '../TooltipContent';
import { useChartData } from './useChartData';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type ChartProp = {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  stat: ChartStat;
  bucket: TimeBucket;
  toggles: LineTogglesState;
};
export const Graph = memo<ChartProp>(function ({ vaultId, oracleId, stat, bucket, toggles }) {
  const classes = useStyles();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));
  const { min, max, avg, data } = useChartData(stat, vaultId, oracleId, bucket);

  const chartMargin = useMemo(() => {
    return { top: 14, right: isMobile ? 16 : 24, bottom: 0, left: isMobile ? 16 : 24 };
  }, [isMobile]);
  const xTickFormatter = useMemo(() => {
    return (value: number) => formatDateTimeTick(value, bucket);
  }, [bucket]);
  const xTickInterval = useMemo(() => {
    return getXInterval(data.length, isMobile);
  }, [data.length, isMobile]);
  const yTickFormatter = useMemo(() => {
    return stat === 'apy'
      ? (value: number) => formatPercent(value)
      : (value: number) => formatUsd(value);
  }, [stat]);
  const yDomain = useMemo(() => {
    return [min, max];
  }, [min, max]);
  const yTicks = useMemo(() => {
    return mapRangeToTicks(min, max);
  }, [min, max]);
  const tooltipContentCreator = useCallback(
    (props: TooltipProps<number, string>) => (
      <TooltipContent
        {...props}
        stat={stat}
        bucket={bucket}
        toggles={toggles}
        valueFormatter={yTickFormatter}
        avg={avg}
      />
    ),
    [stat, bucket, toggles, yTickFormatter, avg]
  );

  return (
    <div className={classes.chartContainer}>
      <ResponsiveContainer height={200}>
        <AreaChart data={data} className={classes.graph} height={200} margin={chartMargin}>
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />
          <XAxis
            dataKey="t"
            tickMargin={10}
            tickFormatter={xTickFormatter}
            interval={xTickInterval}
            stroke="#363B63"
            tick={XAxisTick}
            padding="no-gap"
          />
          <Area
            dataKey="h"
            stroke="#F5F5FF"
            strokeWidth={1.5}
            fill="rgba(255, 255, 255, 0.05)"
            fillOpacity={100}
          />
          <Tooltip content={tooltipContentCreator} wrapperStyle={{ outline: 'none' }} />
          {toggles.movingAverage ? (
            <Area dataKey="ma" stroke="#4F93C4" strokeWidth={1.5} fill="none" />
          ) : null}
          {toggles.average ? (
            <ReferenceLine y={avg} stroke="#59A662" strokeWidth={1.5} strokeDasharray="3 3" />
          ) : null}
          <YAxis
            dataKey="h"
            tickFormatter={yTickFormatter}
            domain={yDomain}
            mirror={true}
            stroke="#363B63"
            ticks={yTicks}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

const formatDateTimeTick = (timestamp: number, bucket: TimeBucket) => {
  const date = fromUnixTime(timestamp);
  if (bucket === '1h_1d') {
    return format(date, 'HH:mm');
  }
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};
