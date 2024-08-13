import { memo } from 'react';
import type { VaultEntity } from '../../../../../../data/entities/vault';
import { makeStyles } from '@material-ui/core';
import { Stat } from '../Stat';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../../store';
import { selectClmPnl } from '../../../../../../data/selectors/analytics';
import {
  formatLargeUsd,
  formatPositiveOrNegative,
  formatTokenDisplayCondensed,
} from '../../../../../../../helpers/format';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';
import { Tooltip } from '../../../../../../../components/Tooltip';
import { HelpOutline } from '@material-ui/icons';
import { styles } from './styles';

interface OverviewGraphHeaderProps {
  vaultId: VaultEntity['id'];
}

const useStyles = makeStyles(styles);

export const OverviewGraphHeader = memo<OverviewGraphHeaderProps>(function OverviewGraphHeader({
  vaultId,
}) {
  const classes = useStyles();

  const { t } = useTranslation();

  const {
    sharesNow,
    sharesAtDepositInUsd,
    sharesNowInUsd,
    token0AtDepositInUsd,
    token1AtDepositInUsd,
    token0AtDeposit,
    token1AtDeposit,
    token1,
    token0,
    token0Diff,
    token1Diff,
    pnl,
    hold,
    holdDiff,
  } = useAppSelector(state => selectClmPnl(state, vaultId));

  return (
    <div className={classes.statsContainer}>
      <Stat
        tooltipText={t('pnl-graph-tooltip-deposit')}
        label={t('At Deposit')}
        value0={`${formatTokenDisplayCondensed(token0AtDeposit, token0.decimals, 6)} ${
          token0.symbol
        }`}
        value1={`${formatTokenDisplayCondensed(token1AtDeposit, token1.decimals, 6)} ${
          token1.symbol
        }`}
        value2={formatTokenDisplayCondensed(sharesNow, 18, 6)}
        subValue0={formatLargeUsd(token0AtDepositInUsd)}
        subValue1={formatLargeUsd(token1AtDepositInUsd)}
        subValue2={formatLargeUsd(sharesAtDepositInUsd)}
      />
      <Stat
        tooltipText={t('pnl-graph-tooltip-now-clm')}
        label={t('Now')}
        value0={`${formatTokenDisplayCondensed(token0.userAmount, token0.decimals, 6)} ${
          token0.symbol
        }`}
        value1={`${formatTokenDisplayCondensed(token1.userAmount, token1.decimals, 6)} ${
          token1.symbol
        }`}
        value2={formatTokenDisplayCondensed(sharesNow, 18, 6)}
        subValue0={formatLargeUsd(token0.userValue)}
        subValue1={formatLargeUsd(token1.userValue)}
        subValue2={formatLargeUsd(sharesNowInUsd)}
      />
      <Stat
        tooltipText={t('pnl-graph-tooltip-change-clm')}
        label={t('Change')}
        value0={formatPositiveOrNegative(
          token0Diff,
          formatTokenDisplayCondensed(token0Diff, token0.decimals, 6),
          token0.symbol
        )}
        value1={formatPositiveOrNegative(
          token1Diff,
          formatTokenDisplayCondensed(token1Diff, token1.decimals, 6),
          token1.symbol
        )}
        value2={
          <div className={pnl.gt(BIG_ZERO) ? classes.green : classes.red}>
            {formatPositiveOrNegative(pnl, formatLargeUsd(pnl), 'PNL')}{' '}
          </div>
        }
        subValue2={
          <Tooltip
            children={
              <div className={classes.tooltip}>
                {`${formatLargeUsd(hold)} HOLD`} <HelpOutline />
              </div>
            }
            content={
              <div>
                <div className={classes.itemContainer}>
                  <div className={classes.label}>{t('CLM VS HOLD')}</div>
                  <div className={classes.value}>
                    {formatPositiveOrNegative(holdDiff, formatLargeUsd(holdDiff))}
                  </div>
                </div>
              </div>
            }
            contentClass={classes.tooltipContent}
            arrowClass={classes.arrow}
          />
        }
      />
    </div>
  );
});
