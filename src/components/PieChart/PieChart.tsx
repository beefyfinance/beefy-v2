import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from 'recharts';
import { PieChartTooltip } from '../PieChartTooltip/PieChartTooltip.tsx';
import { CHART_COLORS } from '../../helpers/charts.ts';
import type { PieChartProps } from './types.ts';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';
import { token } from '@repo/styles/tokens';

export const PieChart = memo(function PieChart({ data, type, formatter }: PieChartProps) {
  const smUp = useBreakpoint({ from: 'sm' });
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
          <Cell
            key={asset.key}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            stroke={'#242842'}
            strokeWidth={2}
          />
        ))}
      </Pie>
      <Tooltip
        wrapperStyle={{ outline: 'none', zIndex: token('zIndex.tooltip') }}
        content={<PieChartTooltip type={type} formatter={formatter} />}
      />
    </RechartsPieChart>
  );
});
