import { memo, useCallback, useMemo } from 'react';
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
import type { VaultEntity } from '../../../../data/entities/vault';
import type { TokenEntity } from '../../../../data/entities/token';
import type { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import type { Theme } from '@material-ui/core';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { format, fromUnixTime } from 'date-fns';
import { XAxisTick } from '../../../../../components/XAxisTick';
import { domainOffSet, getXInterval, mapRangeToTicks } from '../../../../../helpers/graph/graph';
import {
  formatPercent,
  formatTokenDisplayCondensed,
  formatUsd,
} from '../../../../../helpers/format';
import type { LineTogglesState } from '../LineToggles';
import { type BaseTooltipProps, TooltipContent } from '../TooltipContent';
import { useChartData } from './useChartData';
import { styles } from './styles';
import { useAppSelector } from '../../../../../store';
import { selectVaultById } from '../../../../data/selectors/vaults';
import { max as lodashMax } from 'lodash-es';
import type { ChartStat } from '../types';

const useStyles = makeStyles(styles);

export type ChartProp<TStat extends ChartStat> = {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  stat: TStat;
  bucket: ApiTimeBucket;
  toggles: LineTogglesState;
};

export const Graph = memo(function Graph<TStat extends ChartStat>({
  vaultId,
  oracleId,
  stat,
  bucket,
  toggles,
}: ChartProp<TStat>) {
  const classes = useStyles();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true });
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const vaultType = vault.type;
  const chartData = useChartData(stat, vaultId, oracleId, bucket);
  if (!chartData) {
    throw new Error('No chart data found.');
  }

  const { min, max, avg, data } = chartData;

  const chartMargin = useMemo(() => {
    return { top: 14, right: isMobile ? 16 : 24, bottom: 0, left: isMobile ? 16 : 24 };
  }, [isMobile]);

  const xTickFormatter = useMemo(() => {
    return (value: number) => formatDateTimeTick(value, bucket);
  }, [bucket]);

  const xTickInterval = useMemo(() => {
    return getXInterval(data.length, isMobile);
  }, [data.length, isMobile]);

  const yTickFormatter = useMemo(() => {
    return stat === 'apy'
      ? (value: number) => formatPercent(value)
      : stat === 'clm'
      ? (value: number) => formatTokenDisplayCondensed(value, 18)
      : (value: number) => formatUsd(value);
  }, [stat]);

  const diff = useMemo(() => {
    return domainOffSet(min, max, 0.8);
  }, [max, min]);

  const startYDomain = useMemo(() => {
    return lodashMax([0, min - diff])!;
  }, [diff, min]);

  const yDomain = useMemo(() => {
    return [startYDomain, max + diff];
  }, [diff, max, startYDomain]);

  const yTicks = useMemo(() => {
    return mapRangeToTicks(min, max + diff);
  }, [min, max, diff]);

  const isClm = stat === 'clm';

  const tooltipContentCreator = useCallback(
    (props: BaseTooltipProps<TStat>) => (
      <TooltipContent<TStat>
        {...props}
        stat={stat}
        bucket={bucket}
        toggles={isClm ? { movingAverage: false, average: false } : toggles}
        valueFormatter={yTickFormatter}
        avg={avg}
        vaultType={vaultType}
      />
    ),
    [stat, bucket, isClm, toggles, yTickFormatter, avg, vaultType]
  );

  return (
    <div className={classes.chartContainer}>
      <ResponsiveContainer height={250}>
        <ComposedChart
          data={data}
          className={classes.graph}
          height={200}
          margin={chartMargin}
          barCategoryGap={'30%'}
        >
          <CartesianGrid strokeDasharray="2 2" vertical={!isClm} stroke="#363B63" />
          <XAxis
            dataKey="t"
            tickMargin={10}
            tickFormatter={xTickFormatter}
            interval={xTickInterval}
            stroke="#363B63"
            tick={XAxisTick}
            padding="no-gap"
          />
          <Area
            dataKey="v"
            stroke="#F5F5FF"
            strokeWidth={1.5}
            fill="rgba(255, 255, 255, 0.05)"
            fillOpacity={isClm ? 0 : 100}
          />
          {isClm ? <Bar dataKey="ranges" fill="#6A71AE4C" /> : null}
          <Tooltip content={tooltipContentCreator} wrapperStyle={{ outline: 'none' }} />
          {!isClm && toggles.movingAverage ? (
            <Area dataKey="ma" stroke="#5C70D6" strokeWidth={1.5} fill="none" />
          ) : null}
          {!isClm && toggles.average ? (
            <ReferenceLine y={avg} stroke="#4DB258" strokeWidth={1.5} strokeDasharray="3 3" />
          ) : null}
          <YAxis
            dataKey="v"
            tickFormatter={yTickFormatter}
            domain={yDomain}
            mirror={true}
            stroke="#363B63"
            ticks={yTicks}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

const formatDateTimeTick = (timestamp: number, bucket: ApiTimeBucket) => {
  const date = fromUnixTime(timestamp);
  if (bucket === '1h_1d') {
    return format(date, 'HH:mm');
  }
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
};
