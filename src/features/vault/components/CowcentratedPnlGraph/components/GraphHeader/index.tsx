import React, { memo } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { makeStyles, type Theme } from '@material-ui/core';
import { Stat } from '../Stat';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { selectClmPnl } from '../../../../../data/selectors/analytics';
import {
  formatLargeUsd,
  formatPositiveOrNegative,
  formatTokenDisplayCondensed,
} from '../../../../../../helpers/format';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

interface GraphHeaderProps {
  vaultId: VaultEntity['id'];
}

const useStyles = makeStyles((theme: Theme) => ({
  statsContainer: {
    display: 'grid',
    gap: '1px',
    gridTemplateColumns: 'repeat(3, 1fr)',
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
  red: {
    color: theme.palette.background.indicators.error,
  },
  green: {
    color: theme.palette.background.indicators.success,
  },
}));

export const GraphHeader = memo<GraphHeaderProps>(function GraphHeader({ vaultId }) {
  const classes = useStyles();

  const { t } = useTranslation();

  const {
    shares,
    sharesAtDepositToUsd,
    sharesNowToUsd,
    token0SharesAtDepositToUsd,
    token1SharesAtDepositToUsd,
    token0SharesAtDeposit,
    token1SharesAtDeposit,
    token1,
    token0,
    token0Diff,
    token1Diff,
    pnl,
  } = useAppSelector(state => selectClmPnl(state, vaultId));

  return (
    <div className={classes.statsContainer}>
      <Stat
        label={t('At Deposit')}
        value0={`${formatTokenDisplayCondensed(token0SharesAtDeposit, token0.decimals, 6)} ${
          token0.symbol
        }`}
        value1={`${formatTokenDisplayCondensed(token1SharesAtDeposit, token1.decimals, 6)} ${
          token1.symbol
        }`}
        value2={formatTokenDisplayCondensed(shares, 18, 6)}
        subValue0={formatLargeUsd(token0SharesAtDepositToUsd)}
        subValue1={formatLargeUsd(token1SharesAtDepositToUsd)}
        subValue2={formatLargeUsd(sharesAtDepositToUsd)}
      />
      <Stat
        label={t('Now')}
        value0={`${formatTokenDisplayCondensed(token0.userAmount, token0.decimals, 6)} ${
          token0.symbol
        }`}
        value1={`${formatTokenDisplayCondensed(token1.userAmount, token1.decimals, 6)} ${
          token1.symbol
        }`}
        value2={formatTokenDisplayCondensed(shares, 18, 6)}
        subValue0={formatLargeUsd(token0.userValue)}
        subValue1={formatLargeUsd(token1.userValue)}
        subValue2={formatLargeUsd(sharesNowToUsd)}
      />
      <Stat
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
        value2={formatPositiveOrNegative(pnl, formatLargeUsd(pnl), 'PNL')}
        value2ClassName={pnl.gt(BIG_ZERO) ? classes.green : classes.red}
      />
    </div>
  );
});
