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
import type { VaultEntity } from '../../../../data/entities/vault';
import { useAppSelector } from '../../../../../store';
import { selectVaultTokenSymbols } from '../../../../data/selectors/tokens';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format';
import { isArray } from 'lodash-es';

const useStyles = makeStyles(styles);

export type TooltipContentProps = TooltipProps<number, string> & {
  stat: ChartStat;
  bucket: ApiTimeBucket;
  toggles: LineTogglesState;
  valueFormatter: (value: number) => string;
  avg: number;
  vaultType: 'standard' | 'gov' | 'cowcentrated';
  vaultId: VaultEntity['id'];
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
  vaultId,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { maPeriods, maUnit } = useMemo(() => getBucketParams(bucket), [bucket]);

  if (!active) {
    return null;
  }

  const [valueLine, maLineOrRanges] = payload!;
  const value = valueLine?.value;
  const maOrRanges: number | number[] | undefined = maLineOrRanges?.value;
  const { t: timestamp } = valueLine.payload;

  const ranges: number[] =
    vaultType === 'cowcentrated' && stat === 'clm' && isArray(maOrRanges) ? maOrRanges : [0, 0];

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>
        {format(fromUnixTime(timestamp), 'MMM d, yyyy h:mm a')}
      </div>
      <div className={classes.grid}>
        <div className={classes.label}>{t([`Graph-${vaultType}-${stat}`, `Graph-${stat}`])}:</div>
        {value ? <div className={classes.value}>{valueFormatter(value)}</div> : null}
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
            {maOrRanges ? <div className={classes.value}>{valueFormatter(maOrRanges)}</div> : null}
          </>
        ) : null}

        {vaultType === 'cowcentrated' && stat === 'clm' ? (
          <Ranges vaultId={vaultId} ranges={ranges} />
        ) : null}
      </div>
    </div>
  );
});

const Ranges = memo<{ vaultId: VaultEntity['id']; ranges: number[] }>(function Ranges({
  vaultId,
  ranges,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const symbols = useAppSelector(state => selectVaultTokenSymbols(state, vaultId));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const priceString = `${symbols[1]}/${symbols[0]}`;

  return (
    <>
      <div className={classes.label}>{t('Range')}:</div>
      <div className={classes.value}>
        {formatTokenDisplayCondensed(ranges[0], 18)} - {formatTokenDisplayCondensed(ranges[1], 18)}{' '}
        {/* {priceString} */}
      </div>
    </>
  );
});
