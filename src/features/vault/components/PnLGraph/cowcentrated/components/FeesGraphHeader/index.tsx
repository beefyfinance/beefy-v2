/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo } from 'react';
import type { VaultEntity } from '../../../../../../data/entities/vault';
import { makeStyles } from '@material-ui/core';
import { Stat } from '../Stat';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../../store';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../../../../../../helpers/format';
import { selectClmAutocompoundedPendingFeesByVaultId } from '../../../../../../data/selectors/analytics';

interface FeesGraphHeaderProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

const useStyles = makeStyles(styles);

export const FeesGraphHeader = memo<FeesGraphHeaderProps>(function FeesGraphHeader({
  vaultId,
  address,
}) {
  const classes = useStyles();

  const { t } = useTranslation();

  const {
    token0AccruedRewards,
    token1AccruedRewards,
    pendingRewards0,
    pendingRewards1,
    token0AccruedRewardsToUsd,
    token1AccruedRewardsToUsd,
    pendingRewards0ToUsd,
    pendingRewards1ToUsd,
    token0Symbol,
    token1Symbol,
    token0Decimals,
    token1Decimals,
    totalAutocompounded,
    totalPending,
  } = useAppSelector(state => selectClmAutocompoundedPendingFeesByVaultId(state, vaultId, address));

  return (
    <div className={classes.statsContainer}>
      <Stat
        tooltipText={t('pnl-graph-tooltip-autocompounded-fees-clm')}
        label={t('Autocompounded fees')}
        value0={`${formatTokenDisplayCondensed(
          token0AccruedRewards,
          token0Decimals,
          6
        )} ${token0Symbol}`}
        subValue0={formatLargeUsd(token0AccruedRewardsToUsd)}
        value1={`${formatTokenDisplayCondensed(
          token1AccruedRewards,
          token1Decimals,
          6
        )} ${token1Symbol}`}
        subValue1={formatLargeUsd(token1AccruedRewardsToUsd)}
      />
      <Stat
        tooltipText={t('pnl-graph-tooltip-pending-fees-clm')}
        label={t('Pending fees')}
        value0={`${formatTokenDisplayCondensed(
          pendingRewards0,
          token0Decimals,
          6
        )} ${token0Symbol}`}
        subValue0={formatLargeUsd(pendingRewards0ToUsd)}
        value1={`${formatTokenDisplayCondensed(
          pendingRewards1,
          token1Decimals,
          6
        )} ${token1Symbol}`}
        subValue1={formatLargeUsd(pendingRewards1ToUsd)}
      />
      <Stat
        tooltipText={t('pnl-graph-tooltip-total-fees-clm')}
        label={t('Total fees')}
        value0={t('Autocompounded')}
        subValue0={formatLargeUsd(totalAutocompounded)}
        value1={t('Pending')}
        subValue1={formatLargeUsd(totalPending)}
      />
    </div>
  );
});
