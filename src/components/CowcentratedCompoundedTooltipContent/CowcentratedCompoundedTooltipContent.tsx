import { memo, useMemo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import type { TokenEntity } from '../../features/data/entities/token';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import type { UserClmPnl } from '../../features/data/selectors/analytics-types';
import { BIG_ZERO } from '../../helpers/big-number';

const useStyles = makeStyles(styles);

type CowcentratedCompoundedTooltipContentProps = {
  yields: UserClmPnl['yields'];
  tokens: readonly [TokenEntity, TokenEntity];
};

export const CowcentratedCompoundedTooltipContent = memo<CowcentratedCompoundedTooltipContentProps>(
  function CowcentratedCompoundedTooltipContent({ yields, tokens }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const items = useMemo(
      () =>
        tokens.map(token => ({
          token: token,
          amount: yields.compounded.tokens[token.address]?.amount ?? BIG_ZERO,
          amountUsd: yields.compounded.tokens[token.address]?.usd ?? BIG_ZERO,
        })),
      [tokens, yields]
    );

    return (
      <div>
        <div className={classes.tooltipTitle}>{t('VaultStat-Tooltip-Autocompounded')}</div>
        <div className={classes.rewardsContainer}>
          {items.map(item => {
            return (
              <div key={item.token.address}>
                <div className={classes.rewardsText}>
                  {formatTokenDisplayCondensed(item.amount, item.token.decimals)}{' '}
                  {item.token.symbol}
                </div>
                <div className={classes.usdPrice}>{formatLargeUsd(item.amountUsd)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
