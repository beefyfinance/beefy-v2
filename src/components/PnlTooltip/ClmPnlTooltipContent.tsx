import { Fragment, memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { type UserClmPnl } from '../../features/data/selectors/analytics-types';
import { formatLargeUsd } from '../../helpers/format';
import { featureFlag_detailedTooltips } from '../../features/data/utils/feature-flags';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export type ClmPnlTooltipContentProps = { userPnl: UserClmPnl };

export const ClmPnlTooltipContent = memo<ClmPnlTooltipContentProps>(function PnlTooltipContent({
  userPnl,
}) {
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
      {yields.claimed.sources.length ? (
        <>
          <div className={classes.itemContainer}>
            <div className={classes.label}>{t('Claimed Rewards')}</div>
            <div className={classes.value}>{formatLargeUsd(yields.claimed.usd)}</div>
          </div>
          {detailed ? (
            <div className={classes.valueBreakdown}>
              {yields.claimed.sources.map(source => (
                <Fragment key={`${source.source}-${source.token.symbol}`}>
                  <div className={classes.label}>
                    {source.source} {source.token.symbol}
                  </div>
                  <div className={classes.value}>{formatLargeUsd(source.usd)}</div>
                </Fragment>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {yields.pending.sources.length ? (
        <>
          <div className={classes.itemContainer}>
            <div className={classes.label}>{t('Unclaimed Rewards')}</div>
            <div className={classes.value}>{formatLargeUsd(yields.pending.usd)}</div>
          </div>
          {detailed ? (
            <div className={classes.valueBreakdown}>
              {yields.pending.sources.map(source => (
                <Fragment key={`${source.source}-${source.token.symbol}`}>
                  <div className={classes.label}>
                    {source.source} {source.token.symbol}
                  </div>
                  <div className={classes.value}>{formatLargeUsd(source.usd)}</div>
                </Fragment>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      <div className={classes.itemContainer}>
        <div className={classes.label}>{t('Total PNL')}</div>
        <div className={classes.value}>{formatLargeUsd(pnl.withClaimedPending.usd)}</div>
      </div>
    </div>
  );
});
