import { Theme, useMediaQuery } from '@material-ui/core';
import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from 'recharts';
import { BaseEntry } from '../../features/data/utils/array-utils';
import { PieChartTooltip } from '../PieChartTooltip';

export type TypeChart = 'chain' | 'platform' | 'token' | 'assetAvailability';

interface ChartProps {
  data: BaseEntry[];
  type?: TypeChart;
  formatter?: (s: string) => string;
}

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#7FB24D', '#1e9c05'];

export const PieChart = memo<ChartProps>(function ({ data, type, formatter }) {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const chartPxs = useMemo(() => {
    return smUp ? 164 : 124;
  }, [smUp]);

  return (
    <RechartsPieChart height={chartPxs} width={chartPxs}>
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
          <Cell key={asset.key} fill={COLORS[i % data.length]} stroke={'#242842'} strokeWidth={2} />
        ))}
      </Pie>
      <Tooltip
        wrapperStyle={{ outline: 'none' }}
        content={<PieChartTooltip type={type} formatter={formatter} />}
      />
    </RechartsPieChart>
  );
});
