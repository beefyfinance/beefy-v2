import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { format } from 'date-fns';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../../../helpers/format';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    ...theme.typography['body-lg'],
    color: theme.palette.text.tooltips,
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

// TODO: fix this type
type PayloadData = {
  datetime: string;
  underlyingBalance: string;
  usdBalance: string;
};

interface TooltipProps {
  active?: boolean;
  payload?: { payload: PayloadData }[];
}

export const PnLTooltip = memo<TooltipProps>(function PnLTooltip({ active, payload }) {
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
          <div className={classes.value}>{formatTokenDisplayCondensed(shares, 18)}</div>
        </div>
        <div className={classes.item}>
          <div>{t('pnl-tooltip-deposit-usd')}</div>
          <div className={classes.value}>{formatLargeUsd(usdBalance)}</div>
        </div>
      </div>
    );
  }

  return null;
});
