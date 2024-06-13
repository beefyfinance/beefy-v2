import React, { memo, useCallback, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFeesChartData } from './hooks';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { GraphLoader } from '../../../GraphLoader';
import { max } from 'lodash-es';
import {
  domainOffSet,
  formatDateTimeTick,
  formatUsdTick,
  getXInterval,
  type GraphBucket,
  mapRangeToTicks,
} from '../../../../../../helpers/graph';
import { styles } from './styles';
import { XAxisTick } from '../../../../../../components/XAxisTick';
import { FeesTooltip, type FeesTooltipProps } from '../Tooltips';
import { useAppSelector } from '../../../../../../store';
import { selectCowcentratedVaultDepositTokens } from '../../../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

interface CLMFeesGraphProps {
  vaultId: string;
  period: number;
  address?: string;
}

const FEES_TIME_BUCKET: GraphBucket[] = ['1h_1w', '1d_1M', '1d_all'];

export const CLMFeesGraph = memo<CLMFeesGraphProps>(function CLMFeesGraph({
  vaultId,
  period,
  address,
}) {
  const classes = useStyles();

  const { token0, token1 } = useAppSelector(state =>
    selectCowcentratedVaultDepositTokens(state, vaultId)
  );

  const { chartData, isLoading } = useFeesChartData(FEES_TIME_BUCKET[period], vaultId, address);

  const { data, minUsd, maxUsd } = chartData;

  const usdDiff = useMemo(() => {
    return domainOffSet(minUsd, maxUsd, 0.88);
  }, [maxUsd, minUsd]);

  const startUsdDomain = useMemo(() => {
    return max([0, minUsd - usdDiff])!;
  }, [minUsd, usdDiff]);

  const usdAxisDomain = useMemo<[number, number]>(() => {
    return [startUsdDomain, maxUsd + usdDiff];
  }, [maxUsd, startUsdDomain, usdDiff]);

  const usdTicks = useMemo(() => {
    return mapRangeToTicks(startUsdDomain, maxUsd + usdDiff);
  }, [maxUsd, startUsdDomain, usdDiff]);

  const dateTimeTickFormatter = useMemo(() => {
    return (value: number) => formatDateTimeTick(value, FEES_TIME_BUCKET[period]);
  }, [period]);

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true });

  const xInterval = useMemo(() => {
    return getXInterval(data.length, xsDown);
  }, [data.length, xsDown]);

  const xMargin = useMemo(() => {
    return xsDown ? 16 : 24;
  }, [xsDown]);

  const tooltipContentCreator = useCallback(
    (props: Omit<FeesTooltipProps, 'token0Symbol' | 'token1Symbol'>) => (
      <FeesTooltip token0Symbol={token0.symbol} token1Symbol={token1.symbol} {...props} />
    ),
    [token0.symbol, token1.symbol]
  );

  if (isLoading) {
    return <GraphLoader imgHeight={220} />;
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
            tickFormatter={dateTimeTickFormatter}
            dataKey="t"
            padding="no-gap"
            tickMargin={10}
            stroke="#363B63"
            interval={xInterval}
            tick={XAxisTick}
          />
          <Line
            yAxisId="usd"
            strokeWidth={1.5}
            dataKey="v0"
            stroke="#5C70D6"
            dot={false}
            type="linear"
          />
          <Line
            yAxisId="usd"
            strokeWidth={1.5}
            dataKey="v1"
            stroke="#4DB258"
            dot={false}
            type="linear"
          />
          <YAxis
            stroke="#363B63"
            strokeWidth={1.5}
            tickFormatter={formatUsdTick}
            yAxisId="usd"
            domain={usdAxisDomain}
            ticks={usdTicks}
            mirror={true}
          />
          <Tooltip wrapperStyle={{ outline: 'none' }} content={tooltipContentCreator} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
