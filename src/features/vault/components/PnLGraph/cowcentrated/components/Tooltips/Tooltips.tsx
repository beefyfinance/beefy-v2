import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatTokenDisplayCondensed, formatUsd } from '../../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { featureFlag_detailedTooltips } from '../../../../../../data/utils/feature-flags.ts';
import type {
  ClmInvestorFeesTimeSeriesPoint,
  ClmInvestorOverviewTimeSeriesPoint,
} from '../../../../../../../helpers/graph/timeseries.ts';
import type { TokenEntity } from '../../../../../../data/entities/token.ts';
import type { RechartsTooltipProps } from '../../../../../../../helpers/graph/types.ts';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  content: css.raw({
    textStyle: 'body',
    color: 'text.lightest',
    padding: '12px 16px',
    minWidth: '250px',
    background: 'graphTooltipBackground',
    borderRadius: '8px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),
  value: css.raw({
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'right',
  }),
  itemContainer: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  }),
  label: css.raw({
    color: 'text.dark',
  }),
});

export type OverviewTooltipProps = RechartsTooltipProps<
  'underlyingUsd',
  'timestamp',
  ClmInvestorOverviewTimeSeriesPoint
>;

export const OverviewTooltip = memo(function OverviewTooltip({
  active,
  payload,
}: OverviewTooltipProps) {
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
      <div>{format(timestamp, 'MMM d, yyyy h:mm a')}</div>
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
      {featureFlag_detailedTooltips() ?
        Object.entries(debug).map(([key, value]) => (
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

export const FeesTooltip = memo(function FeesTooltip({
  active,
  payload,
  tokens,
}: FeesTooltipProps) {
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
      <div>{format(timestamp, 'MMM d, yyyy h:mm a')}</div>
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
