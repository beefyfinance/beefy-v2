import * as React from "react";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,} from "recharts";
import {Box} from "@material-ui/core"

const chartData = [
    { name: "28 Jan", apy: 45.00 },
    { name: "4 Feb", apy: 57.15 },
    { name: "11 Feb", apy: 38.50 },
    { name: "18 Feb", apy: 41.37 }
];

const HistoricalRateChart = () => {
  return (
    // <Box style={{ height: 250 }}>
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
    // </Box>
  );
};

export default HistoricalRateChart;