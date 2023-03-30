import { makeStyles, Theme } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBigNumberSignificant, formatBigUsd } from '../../../../../../helpers/format';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    ...theme.typography['body-lg'],
    color: '#272B4A',
    padding: '12px 16px',
    minWidth: '250px',
    background: '#fff',
    borderRadius: '8px',
    textAlign: 'left' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    columnGap: '4px',
  },
  value: {
    fontWeight: 500,
  },
}));

interface TooltipProps {
  active?: any;
  payload?: any;
}

export const PnLTooltip = memo<TooltipProps>(function ({ active, payload }) {
  const classes = useStyles();
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const formattedDate = format(new Date(payload[0].payload.datetime), 'MMM d, yyyy h:mm a');
    const shares = new BigNumber(payload[0].payload.underlyingBalance);
    const usdBalance = new BigNumber(payload[0].payload.usdBalance);

    return (
      <div className={classes.container}>
        <div>{formattedDate}</div>
        <div className={classes.item}>
          <div>{t('pnl-tooltip-deposit')}</div>
          <div className={classes.value}>{formatBigNumberSignificant(shares)}</div>
        </div>
        <div className={classes.item}>
          <div>{t('pnl-tooltip-deposit-usd')}</div>
          <div className={classes.value}>{formatBigUsd(usdBalance)}</div>
        </div>
      </div>
    );
  }

  return null;
});
