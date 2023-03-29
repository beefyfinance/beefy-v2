import React, { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { TooltipProps } from 'recharts';
import { ChartStat } from '../../../../data/reducers/historical-types';
import { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import { LineTogglesState } from '../LineToggles';
import { format, fromUnixTime } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getBucketParams } from '../utils';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type TooltipContentProps = TooltipProps<number, string> & {
  stat: ChartStat;
  bucket: ApiTimeBucket;
  toggles: LineTogglesState;
  valueFormatter: (value: number) => string;
  avg: number;
};

export const TooltipContent = memo<TooltipContentProps>(function ({
  active,
  payload,
  stat,
  bucket,
  toggles,
  valueFormatter,
  avg,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { maPeriods, maUnit } = useMemo(() => getBucketParams(bucket), [bucket]);

  if (!active) {
    return null;
  }

  const [valueLine, maLine] = payload;
  const [value, ma] = [valueLine?.value, maLine?.value];
  const { t: timestamp } = valueLine.payload;

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>
        {format(fromUnixTime(timestamp), 'MMM d, yyyy h:mm a')}
      </div>
      <div className={classes.grid}>
        <div className={classes.label}>{t(`Graph-${stat}`)}:</div>
        <div className={classes.value}>{valueFormatter(value)}</div>
        {toggles.average ? (
          <>
            <div className={classes.label}>{t('Average')}:</div>
            <div className={classes.value}>{valueFormatter(avg)}</div>
          </>
        ) : null}
        {toggles.movingAverage ? (
          <>
            <div className={classes.label}>
              <div>{t('Moving-Average')}:</div>
              <div className={classes.labelDetail}>{`(${maPeriods} ${t(maUnit)})`}</div>
            </div>
            <div className={classes.value}>{valueFormatter(ma)}</div>
          </>
        ) : null}
      </div>
    </div>
  );
});
