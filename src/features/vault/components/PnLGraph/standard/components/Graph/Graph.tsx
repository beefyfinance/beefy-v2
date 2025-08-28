import React from 'react';
import { Line, YAxis } from 'recharts';

export const StandardGraph = ({ underlyingAxis }: any) => (
  <>
    <Line
      yAxisId="underlying"
      strokeWidth={1.5}
      dataKey="underlyingBalance"
      stroke="#72D286"
      dot={false}
      type="linear"
    />

    <YAxis
      stroke="#72D286"
      strokeWidth={1.5}
      tickFormatter={underlyingAxis?.formatter}
      yAxisId="underlying"
      domain={underlyingAxis?.domain}
      ticks={underlyingAxis?.ticks}
      mirror={true}
    />
  </>
);

export default StandardGraph;

