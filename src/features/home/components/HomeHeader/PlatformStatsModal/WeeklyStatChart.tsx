import { memo, useCallback, useMemo } from 'react';
import { token } from '@repo/styles/tokens';
import { fromUnixTime } from 'date-fns';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { XAxisTick } from '../../../../../components/XAxisTick/XAxisTick.tsx';
import { minMaxAverage } from '../../../../../helpers/collection.ts';
import { formatUtcChartDate, formatUtcDate } from '../../../../../helpers/date.ts';
import { useXAxis, useYAxis } from '../../../../../helpers/graph/hooks.ts';
import type { TimePointWithMa } from '../../../../data/utils/platform-stats.ts';
import type { LineTogglesState } from '../../../../vault/components/HistoricGraph/LineToggles/LineToggles.tsx';
import { ChartBox } from '../../../../vault/components/HistoricGraph/Graph/styles.ts';
import {
  type BaseTooltipProps,
  TooltipContent,
} from '../../../../vault/components/HistoricGraph/TooltipContent/TooltipContent.tsx';

export type WeeklyStatChartProps = {
  data: TimePointWithMa[];
  series: 'bar' | 'area';
  /** tooltip name of the value */
  label: string;
  maLabel: string;
  toggles: LineTogglesState;
  valueFormatter: (value: number) => string;
  tickFormatterBuilder: (domain: [number, number]) => (value: number) => string;
  height: number;
  compact: boolean;
};

const formatTick = (t: number) => formatUtcChartDate(fromUnixTime(t));
const formatTimestamp = (t: number) => formatUtcDate(fromUnixTime(t));

/** One year of platform stats: weekly bars or a daily area, on the same axes/tooltip as the vault charts */
export const WeeklyStatChart = memo(function WeeklyStatChart({
  data,
  series,
  label,
  maLabel,
  toggles,
  valueFormatter,
  tickFormatterBuilder,
  height,
  compact,
}: WeeklyStatChartProps) {
  const { min, max, avg } = useMemo(() => minMaxAverage(data, 'v', ['v'], ['v']), [data]);
  // bars grow from zero; the area follows the range like the vault TVL chart
  const yAxis = useYAxis(series === 'area' ? min : 0, max, tickFormatterBuilder);
  const xAxis = useXAxis('1d_1Y', data.length, compact);
  const margin = useMemo(
    () => ({ top: 14, right: compact ? 16 : 24, bottom: 0, left: compact ? 16 : 24 }),
    [compact]
  );

  const tooltipContent = useCallback(
    (props: BaseTooltipProps<'tvl'>) => (
      <TooltipContent<'tvl'>
        {...props}
        label={label}
        maLabel={maLabel}
        toggles={toggles}
        valueFormatter={valueFormatter}
        avg={avg}
        formatTimestamp={formatTimestamp}
      />
    ),
    [label, maLabel, toggles, valueFormatter, avg]
  );

  return (
    <ChartBox>
      <ResponsiveContainer height={height}>
        <ComposedChart data={data} margin={margin} barCategoryGap="30%">
          <CartesianGrid
            strokeDasharray="2 2"
            vertical={false}
            stroke={token('colors.graph.grid')}
          />
          <XAxis
            dataKey="t"
            tickMargin={10}
            tickFormatter={formatTick}
            interval={xAxis.interval}
            stroke={token('colors.graph.axis')}
            tick={XAxisTick}
            padding="no-gap"
          />
          {series === 'bar' ?
            <Bar
              dataKey="v"
              fill={token('colors.graph.bar.range')}
              activeBar={{ fill: token('colors.graph.line.heldUsd') }}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          : <Area
              dataKey="v"
              stroke={token('colors.graph.bar.range')}
              strokeWidth={1.5}
              fill={token('colors.graph.bar.range')}
              // recharts defaults Area to fillOpacity 0.6
              fillOpacity={1}
              isAnimationActive={false}
            />
          }
          {toggles.movingAverage ?
            <Area
              dataKey="ma"
              stroke={token('colors.graph.line.movingAverage')}
              strokeWidth={1.5}
              fill="none"
              isAnimationActive={false}
            />
          : null}
          {toggles.average ?
            <ReferenceLine
              y={avg}
              stroke={token('colors.graph.line.average')}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          : null}
          <Tooltip
            content={tooltipContent}
            cursor={series === 'bar' ? false : { stroke: token('colors.graph.axis') }}
            wrapperStyle={{ outline: 'none', zIndex: token('zIndex.tooltip') }}
          />
          <YAxis
            dataKey="v"
            tickFormatter={yAxis.formatter}
            domain={yAxis.domain}
            mirror={true}
            stroke={token('colors.graph.axis')}
            ticks={yAxis.ticks}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartBox>
  );
});
