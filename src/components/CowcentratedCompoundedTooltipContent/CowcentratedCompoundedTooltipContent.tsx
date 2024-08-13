import { memo, useMemo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import type { TokenEntity } from '../../features/data/entities/token';
import type BigNumber from 'bignumber.js';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';

const useStyles = makeStyles(styles);

type CowcentratedCompoundedTooltipContentProps = {
  token0: TokenEntity;
  token1: TokenEntity;
  total0Compounded: BigNumber;
  total0CompoundedUsd: BigNumber;
  total1Compounded: BigNumber;
  total1CompoundedUsd: BigNumber;
};

export const CowcentratedCompoundedTooltipContent = memo<CowcentratedCompoundedTooltipContentProps>(
  function CowcentratedCompoundedTooltipContent({
    total0Compounded,
    total1Compounded,
    total0CompoundedUsd,
    total1CompoundedUsd,
    token0,
    token1,
  }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const items = useMemo(() => {
      return [
        { amount: total0Compounded, amountUsd: total0CompoundedUsd, token: token0 },
        { amount: total1Compounded, amountUsd: total1CompoundedUsd, token: token1 },
      ];
    }, [
      total0Compounded,
      total1Compounded,
      total0CompoundedUsd,
      total1CompoundedUsd,
      token0,
      token1,
    ]);

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
