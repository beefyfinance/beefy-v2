import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatTokenDisplayCondensed, formatUsd } from '../../../../../../../helpers/format';
import { makeStyles, type Theme } from '@material-ui/core';
import { featureFlag_detailedTooltips } from '../../../../../../data/utils/feature-flags';
import type {
  ClmInvestorFeesTimeSeriesPoint,
  ClmInvestorOverviewTimeSeriesPoint,
} from '../../../../../../../helpers/graph/timeseries';
import type { TokenEntity } from '../../../../../../data/entities/token';
import type { RechartsTooltipProps } from '../../../../../../../helpers/graph/types';

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
  'underlyingUsd',
  'timestamp',
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

  const { timestamp, underlying, underlyingUsd, heldUsd, debug } = valueLine.payload;

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>{format(timestamp, 'MMM d, yyyy h:mm a')}</div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t('Graph-cowcentrated-overview-tooltip-position')}:</div>
        <div className={classes.value}>{formatTokenDisplayCondensed(underlying, 18)}</div>
      </div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>
          {t('Graph-cowcentrated-overview-tooltip-position-value')}:
        </div>
        <div className={classes.value}>{formatUsd(underlyingUsd)}</div>
      </div>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t('Graph-cowcentrated-overview-tooltip-hold-value')}:</div>
        <div className={classes.value}>{formatUsd(heldUsd)}</div>
      </div>
      {featureFlag_detailedTooltips()
        ? Object.entries(debug).map(([key, value]) => (
            <div className={classes.itemContainer} key={key}>
              <div className={classes.label}>{key}:</div>
              <div className={classes.value}>{value.toString(10)}</div>
            </div>
          ))
        : null}
    </div>
  );
});

export type FeesTooltipProps = RechartsTooltipProps<
  'values',
  't',
  ClmInvestorFeesTimeSeriesPoint
> & {
  tokens: TokenEntity[];
};

export const FeesTooltip = memo<FeesTooltipProps>(function FeesTooltip({
  active,
  payload,
  tokens,
}) {
  const classes = useStyles();

  if (!active || !payload || !Array.isArray(payload) || !payload.length) {
    return null;
  }

  const valueLine = payload[0];
  if (!valueLine || !valueLine.payload || valueLine.value === undefined) {
    return null;
  }

  const { t: timestamp, values, amounts } = valueLine.payload;

  return (
    <div className={classes.content}>
      <div className={classes.timestamp}>{format(timestamp, 'MMM d, yyyy h:mm a')}</div>
      {tokens.map((token, i) => (
        <div className={classes.itemContainer} key={token.id}>
          <div className={classes.label}>{token.symbol}:</div>
          <div className={classes.value}>
            {formatTokenDisplayCondensed(amounts[i], token.decimals)} ({formatUsd(values[i])})
          </div>
        </div>
      ))}
    </div>
  );
});
