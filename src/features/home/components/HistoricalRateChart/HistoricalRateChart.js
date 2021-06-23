import * as React from "react";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,} from "recharts";
import {Box} from "@material-ui/core"

const HistoricalRateChart = ({chartData}) => {
  return (
    <Box style={{ height: 120, width: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="apy" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HistoricalRateChart;