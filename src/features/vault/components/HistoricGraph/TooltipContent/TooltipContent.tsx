import React, { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import type { TooltipProps } from 'recharts';
import type { ChartStat } from '../../../../data/reducers/historical-types';
import type { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import type { LineTogglesState } from '../LineToggles';
import { format, fromUnixTime } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getBucketParams } from '../utils';
import { styles } from './styles';
import { isArray } from 'lodash-es';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type TooltipContentProps = TooltipProps<number, string> & {
  stat: ChartStat;
  bucket: ApiTimeBucket;
  toggles: LineTogglesState;
  valueFormatter: (value: number) => string;
  avg: number;
  vaultType: 'standard' | 'gov' | 'cowcentrated';
};

export const TooltipContent = memo<TooltipContentProps>(function TooltipContent({
  active,
  payload,
  stat,
  bucket,
  toggles,
  valueFormatter,
  avg,
  vaultType,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { maPeriods, maUnit } = useMemo(() => getBucketParams(bucket), [bucket]);

  const isClmTooltip = useMemo(
    () => vaultType === 'cowcentrated' && stat === 'clm',
    [stat, vaultType]
  );

  if (!active) {
    return null;
  }

  const [valueLine, maLineOrRanges] = payload!;
  const value = valueLine?.value;
  const maOrRanges: number | number[] | undefined = maLineOrRanges?.value;
  const { t: timestamp } = valueLine.payload;

  const ranges: number[] = isClmTooltip && isArray(maOrRanges) ? maOrRanges : [0, 0];

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>
        {format(fromUnixTime(timestamp), 'MMM d, yyyy h:mm a')}
      </div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t([`Graph-${vaultType}-${stat}`, `Graph-${stat}`])}:</div>
        {value ? (
          <div className={classes.value}>
            {isClmTooltip ? <RangeIndicator ranges={ranges} value={value} /> : null}
            {valueFormatter(value)}
          </div>
        ) : null}
      </div>
      {toggles.average ? (
        <div className={classes.itemContainer}>
          <div className={classes.label}>{t('Average')}:</div>
          <div className={classes.value}>{valueFormatter(avg)}</div>
        </div>
      ) : null}
      {toggles.movingAverage ? (
        <div className={classes.itemContainer}>
          <div className={classes.label}>
            <div>{t('Moving-Average')}:</div>
            <div className={classes.labelDetail}>{`(${maPeriods} ${t(maUnit)})`}</div>
          </div>
          {maOrRanges ? <div className={classes.value}>{valueFormatter(maOrRanges)}</div> : null}
        </div>
      ) : null}

      {vaultType === 'cowcentrated' && stat === 'clm' ? (
        <Ranges valueFormatter={valueFormatter} ranges={ranges} />
      ) : null}
    </div>
  );
});

const RangeIndicator = memo<{ ranges: number[]; value: number }>(function RangeIndicator({
  ranges,
  value,
}) {
  const classes = useStyles();

  const isOnRange = useMemo(() => value >= ranges[0] && value <= ranges[1], [ranges, value]);

  return <div className={clsx(classes.rangeIndicator, { [classes.onRange]: isOnRange })} />;
});

const Ranges = memo<{
  ranges: number[];
  valueFormatter: (value: number) => string;
}>(function Ranges({ ranges, valueFormatter }) {
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
