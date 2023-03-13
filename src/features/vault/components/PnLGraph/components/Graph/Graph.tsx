import React, { memo, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { usePnLChartData } from '../../hooks';
import { PnLTooltip } from '../PnLTooltip';
import { makeStyles, Theme, useMediaQuery } from '@material-ui/core';
import { GraphLoader } from '../../../GraphLoader';
import { max } from 'lodash';
import { formatUnderlyingTick, formatUsdTick, formatXAxis, TIME_BUCKET } from './helpers';
import { Legend } from '../Legend';
import { domainOffSet, mapRangeToTicks, X_AXIS_INTERVAL } from '../../../../../../helpers/graph';

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    padding: '16px 0px',
    '& text': {
      ...theme.typography['subline-sm'],
      fill: theme.palette.text.disabled,
      '&.recharts-cartesian-axis-tick-value': {
        textTransform: 'initial',
      },
    },
  },
  graph: {
    '& .recharts-yAxis': {
      '& .recharts-cartesian-axis-tick': {
        opacity: 1,
        transition: 'ease-in-out 0.5s',
      },
    },
    '&:hover': {
      '& .recharts-yAxis': {
        '& .recharts-cartesian-axis-tick': {
          opacity: 0.5,
          transition: 'ease-in-out 0.5s',
        },
      },
    },
  },
}));

export const Graph = memo(function ({ vaultId, period }: { vaultId: string; period: number }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const classes = useStyles();

  const productKey = useMemo(() => {
    return `beefy:vault:${vault.chainId}:${vault.earnContractAddress.toLowerCase()}`;
  }, [vault.chainId, vault.earnContractAddress]);

  const { chartData, isLoading } = usePnLChartData(TIME_BUCKET[period], productKey, vaultId);

  const { data, minUnderlying, maxUnderlying, minUsd, maxUsd } = chartData;

  const underlyingDiff = useMemo(() => {
    return domainOffSet(minUnderlying, maxUnderlying, 0.88);
  }, [maxUnderlying, minUnderlying]);

  const usdDiff = useMemo(() => {
    return domainOffSet(minUsd, maxUsd, 0.88);
  }, [maxUsd, minUsd]);

  const startUnderlyingDomain = useMemo(() => {
    return max([0, minUnderlying - underlyingDiff]);
  }, [minUnderlying, underlyingDiff]);

  const startUsdDomain = useMemo(() => {
    return max([0, minUsd - usdDiff]);
  }, [minUsd, usdDiff]);

  const underlyingAxisDomain = useMemo<[number, number]>(() => {
    return [startUnderlyingDomain, maxUnderlying + underlyingDiff];
  }, [maxUnderlying, startUnderlyingDomain, underlyingDiff]);

  const usdAxisDomain = useMemo<[number, number]>(() => {
    return [startUsdDomain, maxUsd + usdDiff];
  }, [maxUsd, startUsdDomain, usdDiff]);

  const underlyingTicks = useMemo(() => {
    return mapRangeToTicks(startUnderlyingDomain, maxUnderlying + underlyingDiff);
  }, [maxUnderlying, startUnderlyingDomain, underlyingDiff]);

  const usdTicks = useMemo(() => {
    return mapRangeToTicks(startUsdDomain, maxUsd + usdDiff);
  }, [maxUsd, startUsdDomain, usdDiff]);

  const underlyingTickFormatter = useMemo(() => {
    return (value: number) => formatUnderlyingTick(value, underlyingAxisDomain);
  }, [underlyingAxisDomain]);

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'));

  const xInterval = useMemo(() => {
    return X_AXIS_INTERVAL[period];
  }, [period]);

  const xMargin = useMemo(() => {
    return xsDown ? 16 : 24;
  }, [xsDown]);

  if (isLoading) {
    return <GraphLoader imgHeight={220} />;
  }

  return (
    <div className={classes.graphContainer}>
      <Legend vaultId={vaultId} />
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          width={450}
          height={200}
          data={data}
          margin={{ top: 14, right: xMargin, bottom: 0, left: xMargin }}
          className={classes.graph}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#363B63" />\{' '}
          <XAxis
            tickFormatter={tickitem => formatXAxis(tickitem, TIME_BUCKET[period])}
            dataKey="datetime"
            padding={{ left: 4, right: 4 }}
            tickMargin={10}
            stroke="#363B63"
            interval={xInterval}
          />
          <Line
            yAxisId="underliying"
            strokeWidth={1.5}
            dataKey="underlyingBalance"
            stroke="#59A662"
            dot={false}
            type="linear"
          />
          <Line
            yAxisId="usd"
            strokeWidth={1.5}
            dataKey="usdBalance"
            stroke="#5C99D6"
            dot={false}
            type="linear"
          />
          <YAxis
            stroke="#59A662"
            strokeWidth={1.5}
            tickFormatter={underlyingTickFormatter}
            yAxisId="underliying"
            domain={underlyingAxisDomain}
            ticks={underlyingTicks}
            mirror={true}
          />
          <YAxis
            stroke="#5C99D6"
            orientation="right"
            strokeWidth={1.5}
            tickFormatter={formatUsdTick}
            yAxisId="usd"
            domain={usdAxisDomain}
            ticks={usdTicks}
            mirror={true}
          />
          <Tooltip wrapperStyle={{ outline: 'none' }} content={<PnLTooltip />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
