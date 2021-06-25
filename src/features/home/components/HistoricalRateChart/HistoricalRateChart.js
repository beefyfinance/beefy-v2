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
    const labelPosWithOffsetX = x
    const labelPosWithOffsetY = y - 10
  
    return <text className={classes.paragraph} style={{color: 'white'}} x={labelPosWithOffsetX} y={labelPosWithOffsetY}>{labelValue}</text>;
  };
  const renderDot = (props) => {
    const { index } = props;
    const firstOrLast = index === 0 || index === chartData.length - 1;
    if (firstOrLast) {
      return <Dot {...props} className="recharts-area-dot" />
    } else {
      return undefined
    }
  }
  return (
    <Box style={{ height: 100, width: 200, paddingTop: 20 }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis hide dataKey="name" />
          <YAxis hide />
          <Tooltip /> 
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
    </Box>
  );
};

export default HistoricalRateChart;