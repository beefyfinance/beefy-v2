import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { format, fromUnixTime } from 'date-fns';
import type { TooltipProps } from 'recharts';
import { formatUsd } from '../../../../../../helpers/format';
import { makeStyles, type Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.primary,
    padding: '12px 16px',
    minWidth: '250px',
    background: '#1B1D32',
    borderRadius: '8px',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  value: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'right' as const,
  },
  itemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  label: {
    color: theme.palette.text.dark,
  },
  timestamp: {},
}));

type OverviewTooltipProps = TooltipProps<number, string>;

export const OverviewTooltip = memo<OverviewTooltipProps>(function OverviewTooltip({
  active,
  payload,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [valueLine] = payload!;

  if (!active) {
    return null;
  }

  const { t: timestamp } = valueLine.payload;

  const value = valueLine?.value;

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>
        {format(fromUnixTime(timestamp), 'MMM d, yyyy h:mm a')}
      </div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t('Graph-cowcentrated-clm')}:</div>
        {value ? <div className={classes.value}>{formatUsd(value)}</div> : null}
      </div>
    </div>
  );
});
