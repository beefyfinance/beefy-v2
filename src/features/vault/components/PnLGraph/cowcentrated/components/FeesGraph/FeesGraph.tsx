import { memo, useCallback, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFeesChartData } from './hooks.ts';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { GraphLoader } from '../../../../GraphLoader/Loader.tsx';
import {
  GRAPH_TIME_BUCKETS,
  makeUsdTickFormatter,
} from '../../../../../../../helpers/graph/graph.ts';
import { styles } from './styles.ts';
import { XAxisTick } from '../../../../../../../components/XAxisTick/XAxisTick.tsx';
import { FeesTooltip, type FeesTooltipProps } from '../Tooltips/Tooltips.tsx';
import type { ClmInvestorFeesTimeSeriesPoint } from '../../../../../../../helpers/graph/timeseries.ts';
import { LINE_COLORS } from '../../../../../../../helpers/charts.ts';
import type { GraphBucket } from '../../../../../../../helpers/graph/types.ts';
import { useXAxis, useYAxis } from '../../../../../../../helpers/graph/hooks.ts';
import { useBreakpoint } from '../../../../../../../components/MediaQueries/useBreakpoint.ts';
import { token } from '@repo/styles/tokens';

const useStyles = legacyMakeStyles(styles);

interface CLMFeesGraphProps {
  vaultId: string;
  period: number;
  address?: string;
}

const FEES_TIME_BUCKET: GraphBucket[] = ['1h_1w', '1d_1M', '1d_1Y', '1d_all'];

export const CLMFeesGraph = memo(function CLMFeesGraph({
  vaultId,
  period,
  address,
}: CLMFeesGraphProps) {
  const classes = useStyles();
  const xsDown = useBreakpoint({ to: 'xs' });
  const xMargin = xsDown ? 16 : 24;
  const { chartData, isLoading } = useFeesChartData(FEES_TIME_BUCKET[period], vaultId, address);
  const { data, tokens, minUsd, maxUsd } = chartData;

  const usdAxis = useYAxis(minUsd, maxUsd, makeUsdTickFormatter);
  const dateAxis = useXAxis(GRAPH_TIME_BUCKETS[period], data.length, xsDown);

  const tooltipContentCreator = useCallback(
    (props: Omit<FeesTooltipProps, 'tokens'>) => <FeesTooltip tokens={tokens} {...props} />,
    [tokens]
  );

  const valuePickers = useMemo(() => {
    return tokens.map((_, i) => (p: ClmInvestorFeesTimeSeriesPoint) => p.values[i]);
  }, [tokens]);

  if (isLoading) {
    return <GraphLoader imgHeight={220} />;
  }

  if (!chartData.data.length) {
    return null;
  }

  return (
    <div className={classes.graphContainer}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          width={450}
          height={220}
          data={data}
          margin={{ top: 14, right: xMargin, bottom: 0, left: xMargin }}
          className={classes.graph}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />
          <XAxis
            tickFormatter={dateAxis.formatter}
            dataKey="t"
            padding="no-gap"
            tickMargin={10}
            stroke="#363B63"
            interval={dateAxis.interval}
            tick={XAxisTick}
          />
          {tokens.map((token, i) => (
            <Line
              key={token.id}
              yAxisId="usd"
              strokeWidth={1.5}
              dataKey={valuePickers[i]}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              dot={false}
              type="linear"
            />
          ))}
          <YAxis
            stroke="#363B63"
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
