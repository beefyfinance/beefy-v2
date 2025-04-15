import { memo, useMemo } from 'react';
import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import type { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types.ts';
import type { LineTogglesState } from '../LineToggles/LineToggles.tsx';
import { format, fromUnixTime } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getBucketParams } from '../utils.ts';
import { styles } from './styles.ts';
import { css } from '@repo/styles/css';
import type { ChartDataPoint, ChartStat } from '../types.ts';
import type { RechartsTooltipProps } from '../../../../../helpers/graph/types.ts';

const useStyles = legacyMakeStyles(styles);

export type BaseTooltipProps<TStat extends ChartStat> = RechartsTooltipProps<
  'v',
  't',
  ChartDataPoint<TStat>
>;

export type ExtraTooltipContentProps<TStat extends ChartStat> = {
  stat: TStat;
  bucket: ApiTimeBucket;
  toggles: LineTogglesState;
  valueFormatter: (value: number) => string;
  avg: number;
  vaultType: 'standard' | 'gov' | 'cowcentrated' | 'erc4626';
};

export type TooltipContentProps<TStat extends ChartStat> = BaseTooltipProps<TStat> &
  ExtraTooltipContentProps<TStat>;

function getPayload(props: TooltipContentProps<'clm'>): ChartDataPoint<'clm'> | undefined;
function getPayload(props: TooltipContentProps<ChartStat>): ChartDataPoint<ChartStat> | undefined;
function getPayload(props: TooltipContentProps<ChartStat>): ChartDataPoint<ChartStat> | undefined {
  const { active, payload } = props;
  if (!active || !payload || !Array.isArray(payload) || !payload.length) {
    return undefined;
  }
  const valueLine = payload[0];
  if (!valueLine || !valueLine.payload || valueLine.value === undefined) {
    return undefined;
  }

  return valueLine.payload;
}

export const TooltipContent = memo(function TooltipContent<TStat extends ChartStat>(
  props: TooltipContentProps<TStat>
) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { stat, bucket, toggles, valueFormatter, avg, vaultType } = props;
  const { maPeriods, maUnit } = useMemo(() => getBucketParams(bucket), [bucket]);
  const payload = getPayload(props);
  if (!payload) {
    return null;
  }

  const isClmTooltip = 'ranges' in payload;
  const { t: timestamp, v: value, ma: movingAverage } = payload;

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>
        {format(fromUnixTime(timestamp), 'MMM d, yyyy h:mm a')}
      </div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t([`Graph-${vaultType}-${stat}`, `Graph-${stat}`])}:</div>
        <div className={classes.value}>
          {isClmTooltip ?
            <RangeIndicator ranges={payload.ranges} value={value} />
          : null}
          {valueFormatter(value)}
        </div>
      </div>
      {toggles.average ?
        <div className={classes.itemContainer}>
          <div className={classes.label}>{t('Average')}:</div>
          <div className={classes.value}>{valueFormatter(avg)}</div>
        </div>
      : null}
      {toggles.movingAverage ?
        <div className={classes.itemContainer}>
          <div className={classes.label}>
            <div>{t('Moving-Average')}:</div>
            <div className={classes.labelDetail}>{`(${maPeriods} ${t(maUnit)})`}</div>
          </div>
          <div className={classes.value}>{valueFormatter(movingAverage)}</div>
        </div>
      : null}
      {isClmTooltip ?
        <Ranges valueFormatter={valueFormatter} ranges={payload.ranges} />
      : null}
    </div>
  );
});

type RangeIndicatorProps = {
  ranges: [number, number];
  value: number;
};
const RangeIndicator = memo(function RangeIndicator({ ranges, value }: RangeIndicatorProps) {
  const isOnRange = useMemo(() => value >= ranges[0] && value <= ranges[1], [ranges, value]);

  return <div className={css(styles.rangeIndicator, isOnRange && styles.onRange)} />;
});

type RangesProps = {
  ranges: [number, number];
  valueFormatter: (value: number) => string;
};
const Ranges = memo(function Ranges({ ranges, valueFormatter }: RangesProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.itemContainer}>
      <div className={classes.label}>{t('Range')}:</div>
      <div className={classes.value}>
        {valueFormatter(ranges[0])} - {valueFormatter(ranges[1])}{' '}
      </div>
    </div>
  );
});
