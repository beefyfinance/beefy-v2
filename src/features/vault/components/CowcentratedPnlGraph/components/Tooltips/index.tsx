import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatUsd } from '../../../../../../helpers/format';
import { makeStyles, type Theme } from '@material-ui/core';
import { featureFlag_debugGraph } from '../../../../../data/utils/feature-flags';
import type {
  ClmInvestorFeesTimeSeriesPoint,
  ClmInvestorOverviewTimeSeriesPoint,
} from '../../../../../../helpers/timeserie';
import type { RechartsTooltipProps } from '../../../../../../helpers/graph';

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

export type OverviewTooltipProps = RechartsTooltipProps<
  'v',
  't',
  ClmInvestorOverviewTimeSeriesPoint
>;

export const OverviewTooltip = memo<OverviewTooltipProps>(function OverviewTooltip({
  active,
  payload,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!active || !payload || !Array.isArray(payload) || !payload.length) {
    return null;
  }

  const valueLine = payload[0];
  if (!valueLine || !valueLine.payload || valueLine.value === undefined) {
    return null;
  }

  const { t: timestamp, v, vHold, ...rest } = valueLine.payload;

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>{format(timestamp, 'MMM d, yyyy h:mm a')}</div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t('Graph-cowcentrated-overview-tooltip')}:</div>
        <div className={classes.value}>{formatUsd(v)}</div>
      </div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t('Graph-cowcentrated-overview-tooltip-hold')}:</div>
        <div className={classes.value}>{formatUsd(vHold)}</div>
      </div>
      {featureFlag_debugGraph()
        ? Object.entries(rest).map(([key, value]) => (
            <div className={classes.itemContainer} key={key}>
              <div className={classes.label}>{key}:</div>
              <div className={classes.value}>{value}</div>
            </div>
          ))
        : null}
    </div>
  );
});

export type FeesTooltipProps = RechartsTooltipProps<'v0', 't', ClmInvestorFeesTimeSeriesPoint> & {
  token0Symbol: string;
  token1Symbol: string;
};

export const FeesTooltip = memo<FeesTooltipProps>(function FeesTooltip({
  active,
  payload,
  token1Symbol,
  token0Symbol,
}) {
  const classes = useStyles();

  if (!active || !payload || !Array.isArray(payload) || !payload.length) {
    return null;
  }

  const valueLine = payload[0];
  if (!valueLine || !valueLine.payload || valueLine.value === undefined) {
    return null;
  }

  const { t: timestamp, v0, v1 } = valueLine.payload;

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>{format(timestamp, 'MMM d, yyyy h:mm a')}</div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{token0Symbol}:</div>
        <div className={classes.value}>{formatUsd(v0)}</div>
      </div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{token1Symbol}:</div>
        <div className={classes.value}>{formatUsd(v1)}</div>
      </div>
    </div>
  );
});
