import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
} from '../../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectClmAutocompoundedPendingFeesByVaultId } from '../../../../../../data/selectors/analytics.ts';
import { Stat } from '../Stat/Stat.tsx';
import { styles } from './styles.ts';

interface FeesGraphHeaderProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

const useStyles = legacyMakeStyles(styles);

export const FeesGraphHeader = memo(function FeesGraphHeader({
  vaultId,
  address,
}: FeesGraphHeaderProps) {
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
