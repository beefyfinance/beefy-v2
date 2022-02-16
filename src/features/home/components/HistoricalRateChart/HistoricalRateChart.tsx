import React, { useMemo } from 'react';
import { Area, AreaChart, Dot, XAxis, YAxis } from 'recharts';
import { makeStyles } from '@material-ui/core';
import { styles } from '../../styles';
import { formatApy } from '../../../../helpers/format';
import { useSelector } from 'react-redux';

export const HistoricalRateChart = ({ id }) => {
  const useStyles = makeStyles(styles as any);
  const classes = useStyles();
  const historicalApy = useSelector((state: any) => state.pricesReducer.historicalApy);
  const ApyStatLoader = useSelector((state: any) => state.pricesReducer.ApyStatLoader);
  const chartData = useMemo(
    () => buildChartData(historicalApy, ApyStatLoader, id),
    [historicalApy, ApyStatLoader, id]
  );

  const isDarkTheme = localStorage.getItem('nightMode') === 'true' ? true : false;

  const xAxisDataKey = 'date';
  const yAxisDataKey = 'apy';

  const areaColor = isDarkTheme ? '#313759' : 'rgba(166,152,133,0.2)';
  const lineColor = isDarkTheme ? '#8585A6' : '#A69885';
  const firstColor = lineColor;
  const lastColor = isDarkTheme ? '#FFF' : '#000';

  const renderLabel = props => {
    const { index, x, y } = props;
    const { apy } = chartData[index];
    const labelValue = formatApy(apy /*, '0%'*/); // TODO: fix formatApy
    const first = index === 0;
    const last = index === chartData.length - 1;
    const textStyle = { fontSize: '12px' };
    if (first) {
      const labelPosWithOffsetX = x - ((labelValue as any).length * 4 + 20);
      const labelPosWithOffsetY = y;
      return (
        <text style={textStyle} fill={firstColor} x={labelPosWithOffsetX} y={labelPosWithOffsetY}>
          {labelValue}
        </text>
      );
    } else if (last) {
      const labelPosWithOffsetX = x + 5;
      const labelPosWithOffsetY = y;
      return (
        <text style={textStyle} fill={lastColor} x={labelPosWithOffsetX} y={labelPosWithOffsetY}>
          {labelValue}
        </text>
      );
    } else {
      return null;
    }
  };

  const renderDot = props => {
    const { index } = props;
    const last = index === chartData.length - 1;
    if (last) {
      return <Dot {...props} fill={lastColor} />;
    } else {
      return null;
    }
  };

  return (
    <AreaChart
      data={chartData}
      margin={{ top: 10, right: 55, left: 55, bottom: 0 }}
      height={35}
      width={180}
    >
      <XAxis hide dataKey={xAxisDataKey} />
      <YAxis hide />
      <Area
        className={classes.chart}
        type="monotone"
        dataKey={yAxisDataKey}
        stroke={lineColor}
        fill={areaColor}
        fillOpacity={100}
        label={renderLabel}
        dot={renderDot}
        isAnimationActive={false}
      />
    </AreaChart>
  );
};

const buildChartData = (historicalApy, apy, itemId) => {
  let baseData = [0, 0, 0, 0, 0, 0, 0, 0];

  if (historicalApy && historicalApy[itemId]) {
    baseData = historicalApy[itemId];
  }

  if (apy && apy[itemId]) {
    baseData.push(apy[itemId].totalApy);
  }

  return baseData.map(n => ({ apy: n }));
};
