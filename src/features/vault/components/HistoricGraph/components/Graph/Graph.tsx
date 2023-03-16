import { makeStyles, Theme, useMediaQuery } from '@material-ui/core';
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
  Text,
} from 'recharts';
import { formatPercent, formatUsd } from '../../../../../../helpers/format';
import { domainOffSet, getXInterval, mapRangeToTicks } from '../../../../../../helpers/graph';
import { GraphLoader } from '../../../GraphLoader';
import { AverageState } from '../../HistoricGraph';
import { HistoryChartDataState } from '../../useChartData';
import { CustomTooltip } from '../CustomTooltip';
import { styles } from './styles';

const useStyles = makeStyles(styles);

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

  const dateTimeTickFormatter = useMemo(() => {
    return (value: number) => formatDateTimeTick(value, period);
  }, [period]);

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));

  const xMargin = useMemo(() => {
    return xsDown ? 16 : 24;
  }, [xsDown]);

  const xInterval = useMemo(() => {
    return getXInterval(chartData.data.length, xsDown);
  }, [chartData.data.length, xsDown]);

  if (chartData.loading) {
    return <GraphLoader />;
  }

  return (
    <div className={classes.graphContainer}>
      <ResponsiveContainer height={200}>
        <AreaChart
          data={chartData.data}
          className={classes.graph}
          height={200}
          margin={{ top: 14, right: xMargin, bottom: 0, left: xMargin }}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />
          <XAxis
            dataKey="datetime"
            tickMargin={10}
            tickFormatter={dateTimeTickFormatter}
            interval={xInterval}
            stroke="#363B63"
            tick={Tick}
            padding="no-gap"
          />
          <Area
            dataKey="value"
            stroke="#F5F5FF"
            strokeWidth={1.5}
            fill="rgba(255, 255, 255, 0.05)"
            fillOpacity={100}
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
          <YAxis
            dataKey="value"
            tickFormatter={label => {
              return (stat === 2 ? formatPercent(label) : formatUsd(label)) as any;
            }}
            domain={[startValueDomain, chartData.maxValue + valueDiff]}
            ticks={ticks}
            mirror={true}
            stroke="#363B63"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export const formatDateTimeTick = (tickItem: number, period: number) => {
  const date = new Date(tickItem);
  if (period === 0) {
    return format(date, 'HH:mm');
  }
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};

function Tick({ payload, tickFormatter, visibleTicksCount, index, ...rest }: any) {
  const { value } = payload;
  const halfMaxTickTextWidth = 15;
  let textAnchor =
    index === 0
      ? 'start'
      : index === visibleTicksCount - 1 && rest.x > rest.width + halfMaxTickTextWidth
      ? 'end'
      : 'middle';

  return (
    <Text {...rest} textAnchor={textAnchor} className="recharts-cartesian-axis-tick-value">
      {tickFormatter ? tickFormatter(value) : value}
    </Text>
  );
}
