import { Fragment, memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { type UserClmPnl } from '../../features/data/selectors/analytics-types.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import { featureFlag_detailedTooltips } from '../../features/data/utils/feature-flags.ts';
import { useTranslation } from 'react-i18next';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type ClmPnlTooltipContentProps = {
  userPnl: UserClmPnl;
};

export const ClmPnlTooltipContent = memo(function ClmPnlTooltipContent({
  userPnl,
}: ClmPnlTooltipContentProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { pnl, yields } = userPnl;
  const detailed = featureFlag_detailedTooltips();

  return (
    <div className={classes.container}>
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t('Base PNL')}</div>
        <div className={classes.value}>{formatLargeUsd(pnl.base.usd)}</div>
      </div>
      {yields.claimed.sources.length ?
        <>
          <div className={classes.itemContainer}>
            <div className={classes.label}>{t('Claimed Rewards')}</div>
            <div className={classes.value}>{formatLargeUsd(yields.claimed.usd)}</div>
          </div>
          {detailed ?
            <div className={classes.valueBreakdown}>
              {yields.claimed.sources.map(source => (
                <Fragment key={`${source.source}-${source.token.symbol}`}>
                  <div className={css(styles.label, styles.valueBreakdownLabel)}>
                    {source.source} {source.token.symbol}
                  </div>
                  <div className={css(styles.value, styles.valueBreakdownValue)}>
                    {formatLargeUsd(source.usd)}
                  </div>
                </Fragment>
              ))}
            </div>
          : null}
        </>
      : null}
      {yields.pending.sources.length ?
        <>
          <div className={classes.itemContainer}>
            <div className={classes.label}>{t('Unclaimed Rewards')}</div>
            <div className={classes.value}>{formatLargeUsd(yields.pending.usd)}</div>
          </div>
          {detailed ?
            <div className={classes.valueBreakdown}>
              {yields.pending.sources.map(source => (
                <Fragment key={`${source.source}-${source.token.symbol}`}>
                  <div className={css(styles.label, styles.valueBreakdownLabel)}>
                    {source.source} {source.token.symbol}
                  </div>
                  <div className={css(styles.value, styles.valueBreakdownValue)}>
                    {formatLargeUsd(source.usd)}
                  </div>
                </Fragment>
              ))}
            </div>
          : null}
        </>
      : null}
      <div className={classes.itemContainer}>
        <div className={css(styles.label, styles.totalLabel)}>{t('Total PNL')}</div>
        <div className={css(styles.label, styles.totalValue)}>
          {formatLargeUsd(pnl.withClaimedPending.usd)}
        </div>
      </div>
    </div>
  );
});
