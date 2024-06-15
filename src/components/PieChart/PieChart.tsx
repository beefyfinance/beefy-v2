import type { Theme } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';
import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from 'recharts';
import { PieChartTooltip } from '../PieChartTooltip';
import { CHART_COLORS } from '../../helpers/charts';
import type { PieChartProps } from './types';

export const PieChart = memo<PieChartProps>(function PieChart({ data, type, formatter }) {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'), { noSsr: true });
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
        wrapperStyle={{ outline: 'none' }}
        content={<PieChartTooltip type={type} formatter={formatter} />}
      />
    </RechartsPieChart>
  );
});
