import { memo, type ReactNode, useCallback, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePnLChartData } from './hooks.ts';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { GraphLoader } from '../../../../GraphLoader/Loader.tsx';
import {
  GRAPH_TIME_BUCKETS,
  makeUnderlyingTickFormatter,
  makeUsdTickFormatter,
} from '../../../../../../../helpers/graph/graph.ts';
import { styles } from './styles.ts';
import { XAxisTick } from '../../../../../../../components/XAxisTick/XAxisTick.tsx';
import { OverviewTooltip, type OverviewTooltipProps } from '../Tooltips/Tooltips.tsx';
import { useXAxis, useYAxis } from '../../../../../../../helpers/graph/hooks.ts';
import { GraphNoData } from '../../../../../../../components/GraphNoData/GraphNoData.tsx';
import { useBreakpoint } from '../../../../../../../components/MediaQueries/useBreakpoint.ts';
import { token } from '@repo/styles/tokens';

const useStyles = legacyMakeStyles(styles);

interface CLMOverviewGraphProps {
  vaultId: string;
  period: number;
  address?: string;
}

export const CLMOverviewGraph = memo(function CLMOverviewGraph({
  vaultId,
  period,
  address,
}: CLMOverviewGraphProps) {
  const classes = useStyles();
  const xsDown = useBreakpoint({ to: 'xs' });
  const chartMargin = useMemo(() => {
    const xMargin = xsDown ? 16 : 24;
    return { top: 14, right: xMargin, bottom: 0, left: xMargin };
  }, [xsDown]);
  const { chartData, isLoading, willRetry, type } = usePnLChartData(
    GRAPH_TIME_BUCKETS[period],
    vaultId,
    address
  );
  const { data, minUsd, maxUsd, minUnderlying, maxUnderlying } = chartData;

  const usdAxis = useYAxis(minUsd, maxUsd, makeUsdTickFormatter);
  const underlyingAxis = useYAxis(minUnderlying, maxUnderlying, makeUnderlyingTickFormatter);
  const dateAxis = useXAxis(GRAPH_TIME_BUCKETS[period], data.length, xsDown);

  const tooltipContentCreator = useCallback(
    (props: OverviewTooltipProps): ReactNode => <OverviewTooltip {...props} />,
    []
  );

  if (isLoading) {
    return <GraphLoader imgHeight={220} />;
  }

  if (!data.length) {
    return <GraphNoData reason={willRetry ? 'error-retry' : 'error'} />;
  }

  return (
    <div className={classes.graphContainer}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          width={450}
          height={220}
          data={data}
          margin={chartMargin}
          className={classes.graph}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />
          <XAxis
            tickFormatter={dateAxis.formatter}
            dataKey="timestamp"
            padding="no-gap"
            tickMargin={10}
            stroke="#363B63"
            interval={dateAxis.interval}
            tick={XAxisTick}
          />
          {type === 'vault' && (
            <Line
              yAxisId="underlying"
              strokeWidth={1.5}
              dataKey="underlying"
              stroke="#4DB258"
              dot={false}
              type="linear"
            />
          )}
          <Line
            yAxisId="usd"
            strokeWidth={1.5}
            dataKey="heldUsd"
            stroke="#999CB3"
            dot={false}
            type="linear"
          />
          <Line
            yAxisId="usd"
            strokeWidth={1.5}
            dataKey="underlyingUsd"
            stroke="#5C70D6"
            dot={false}
            type="linear"
          />
          {type === 'vault' && (
            <YAxis
              stroke="#4DB258"
              strokeWidth={1.5}
              tickFormatter={underlyingAxis.formatter}
              yAxisId="underlying"
              domain={underlyingAxis.domain}
              ticks={underlyingAxis.ticks}
              mirror={true}
            />
          )}
          <YAxis
            stroke="#5C70D6"
            orientation="right"
            strokeWidth={1.5}
            tickFormatter={usdAxis.formatter}
            yAxisId="usd"
            domain={usdAxis.domain}
            ticks={usdAxis.ticks}
            mirror={true}
          />
          <Tooltip
            wrapperStyle={{ outline: 'none', zIndex: token('zIndex.tooltip') }}
            content={tooltipContentCreator}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
