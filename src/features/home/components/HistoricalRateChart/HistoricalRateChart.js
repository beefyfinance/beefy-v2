import * as React from "react";
import {AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot} from "recharts";
import {Box, Typography, makeStyles} from "@material-ui/core"
import styles from "../../styles"

const HistoricalRateChart = ({chartData}) => {
  const useStyles = makeStyles(styles);
  const classes = useStyles();
  const areaColor = "#313759";
  const lineColor = "#7b809e";
  const renderLabel = (props) => {
    const { index, x, y } = props;
    const { apy } = chartData[index];
    const labelValue = `${apy}%`
    const first = index === 0;
    const last = index === chartData.length - 1;
    if (first) {
      const labelPosWithOffsetX = x - 30
      const labelPosWithOffsetY = y + 3
      return <text className={classes.paragraph} fill={"#8585A6"} x={labelPosWithOffsetX} y={labelPosWithOffsetY}>{labelValue}</text>;
    } else if (last) {
      const labelPosWithOffsetX = x
      const labelPosWithOffsetY = y - 10
      return <text className={classes.paragraph} fill={'white'} x={labelPosWithOffsetX} y={labelPosWithOffsetY}>{labelValue}</text>;
    }
    else {
      return null
    }
  };
  const renderDot = (props) => {
    const { index } = props;
    const last = index === chartData.length - 1;
    if (last) {
      return <Dot {...props} fill={'white'} className="recharts-area-dot" />
    } else {
      return null
    }
  }
  return (
      <ResponsiveContainer height={50} width={180} paddingRight={10}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
        >
          <XAxis hide dataKey="name" />
          <YAxis hide />
          <Area 
            type="monotone" 
            dataKey="apy" 
            stroke={lineColor}
            fill={areaColor}
            label={renderLabel}
            dot={renderDot}
            />
        </AreaChart>
      </ResponsiveContainer>
  );
};

export default HistoricalRateChart;