import { Theme, useMediaQuery } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChartTooltip } from '../PieChartTooltip';

type ChartProps = {
  data: { key: string; value: BigNumber; percentage: number }[];
  type: 'chain' | 'platform' | 'token';
};

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#7FB24D'];

export const Chart = memo<ChartProps>(function ({ data, type }) {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const chartPxs = useMemo(() => {
    return smUp ? 164 : 124;
  }, [smUp]);

  return (
    <ResponsiveContainer height={chartPxs} width="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="percentage"
          valueKey="value"
          cx="50%"
          cy="50%"
          innerRadius={smUp ? 50 : 30}
          outerRadius={smUp ? 80 : 60}
          paddingAngle={0}
          startAngle={90}
          endAngle={450}
        >
          {data.map((asset, i) => (
            <Cell
              key={asset.key}
              fill={COLORS[i % data.length]}
              stroke={'#242842'}
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<PieChartTooltip type={type} />} />
      </PieChart>
    </ResponsiveContainer>
  );
});
