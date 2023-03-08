import { makeStyles, Theme } from '@material-ui/core';
import { format } from 'date-fns';
import { max } from 'lodash';
import React, { memo, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPercent, formatUsd } from '../../../../../../helpers/format';
import { domainOffSet, mapRangeToTicks, X_AXIS_INTERVAL } from '../../../../../../helpers/graph';
import { GraphLoader } from '../../../GraphLoader';
import { AverageState } from '../../HistoryGraph';
import { HistoryChartDataState } from '../../useChartData';
import { CustomTooltip } from '../CustomTooltip';

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    padding: '24px',
    '& text': {
      ...theme.typography['subline-sm'],
      fill: theme.palette.text.disabled,
    },
    [theme.breakpoints.down('md')]: {
      padding: '16px',
    },
  },
}));

interface GraphProps {
  chartData: HistoryChartDataState;
  movingAverageDetail: string;
  stat: number;
  period: number;
  showAverages: AverageState;
}

export const Graph = memo<GraphProps>(function _Graph({
  chartData,
  movingAverageDetail,
  stat,
  showAverages,
  period,
}) {
  const classes = useStyles();

  const valueDiff = useMemo(() => {
    return domainOffSet(chartData.minValue, chartData.maxValue, 0.88);
  }, [chartData.maxValue, chartData.minValue]);

  const startValueDomain = useMemo(() => {
    return max([0, chartData.minValue - valueDiff]);
  }, [chartData.minValue, valueDiff]);

  const ticks = useMemo(() => {
    return mapRangeToTicks(startValueDomain, chartData.maxValue + valueDiff);
  }, [chartData.maxValue, startValueDomain, valueDiff]);

  const xInterval = useMemo(() => {
    return X_AXIS_INTERVAL[period];
  }, [period]);

  if (chartData.loading) {
    return <GraphLoader />;
  }

  return (
    <div className={classes.graphContainer}>
      <ResponsiveContainer height={200}>
        <AreaChart data={chartData.data} margin={{ top: 14, right: 0, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />
          <YAxis
            dataKey="value"
            tickFormatter={label => {
              return (stat === 2 ? formatPercent(label) : formatUsd(label)) as any;
            }}
            domain={[startValueDomain, chartData.maxValue + valueDiff]}
            ticks={ticks}
          />
          <XAxis
            dataKey="datetime"
            tickMargin={10}
            tickFormatter={tickItem => formatXAxis(tickItem, period)}
            interval={xInterval}
            stroke="#363B63"
          />
          <Tooltip
            wrapperStyle={{ outline: 'none' }}
            content={
              <CustomTooltip
                stat={stat}
                averageValue={chartData.averageValue}
                movingAverageDetail={movingAverageDetail}
                showSimpleAverage={showAverages.simpleAverage}
                showMovingAverage={showAverages.movingAverage}
              />
            }
          />
          <Area
            dataKey="value"
            stroke="#F5F5FF"
            strokeWidth={1.5}
            fill="rgba(245, 245, 255, 0.1)"
            fillOpacity={100}
          />
          {showAverages.movingAverage && (
            <Area dataKey="moveAverageValue" stroke="#4F93C4" strokeWidth={1.5} fill="none" />
          )}
          {showAverages.simpleAverage && (
            <ReferenceLine
              y={chartData.averageValue}
              stroke="#59A662"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export const formatXAxis = (tickItem: number, period: number) => {
  const date = new Date(tickItem);
  if (period === 0) {
    return format(date, 'HH:mm');
  }
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};
