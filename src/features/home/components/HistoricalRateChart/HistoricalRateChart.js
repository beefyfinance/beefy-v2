import * as React from "react";
import {AreaChart, Area, XAxis, YAxis, Dot} from "recharts";
import {makeStyles} from "@material-ui/core"
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
      const labelPosWithOffsetX = x - 20
      const labelPosWithOffsetY = y
      return <text style={{fontSize:"12px"}} fill={"#8585A6"} x={labelPosWithOffsetX} y={labelPosWithOffsetY}>{labelValue}</text>;
    } else if (last) {
      const labelPosWithOffsetX = x + 5
      const labelPosWithOffsetY = y
      return <text style={{fontSize:"12px"}} fill={'white'} x={labelPosWithOffsetX} y={labelPosWithOffsetY}>{labelValue}</text>;
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
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 55, left: 55, bottom: 0 }}
          height={35} 
          width={200}
        >
          <XAxis hide dataKey="name" />
          <YAxis hide />
          <Area 
            className={classes.chart}
            type="monotone" 
            dataKey="apy" 
            stroke={lineColor}
            fill={areaColor}
            fillOpacity={100}
            label={renderLabel}
            dot={renderDot}
            layout={"horizontal"}
            />
        </AreaChart>
  );
};

export default HistoricalRateChart;