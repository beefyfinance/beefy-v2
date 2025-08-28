import React from 'react';
import { Line, YAxis } from 'recharts';

export const OverviewGraph = ({ type, underlyingAxis }: any) => (
  <>
    {type === 'vault' && (
      <Line
        yAxisId="underlying"
        strokeWidth={1.5}
        dataKey="underlying"
        stroke="#72D286"
        dot={false}
        type="linear"
      />
    )}

    {type === 'vault' && (
      <YAxis
        stroke="#72D286"
        strokeWidth={1.5}
        tickFormatter={underlyingAxis?.formatter}
        yAxisId="underlying"
        domain={underlyingAxis?.domain}
        ticks={underlyingAxis?.ticks}
        mirror={true}
      />
    )}
  </>
);

export default OverviewGraph;

