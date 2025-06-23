import { createSelector } from '@reduxjs/toolkit';
import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { isUserClmPnl, type UserVaultPnl } from '../../features/data/selectors/analytics-types.ts';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { formatLargePercent, formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { ClmPnlTooltipContent } from '../PnlTooltip/ClmPnlTooltipContent.tsx';
import { showClmPnlTooltip } from '../PnlTooltip/helpers.ts';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { useTranslation } from 'react-i18next';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: UserVaultPnl;
  walletAddress: string;
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultPnlStatMemoized>>;

export const VaultPnlStat = memo(function ({
  vaultId,
  pnlData,
  walletAddress,
  ...passthrough
}: VaultDailyStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, ...statProps } = useAppSelector(state =>
    selectVaultPnlStatMemoized(state, vaultId, pnlData, walletAddress)
  );
  return <VaultValueStat label={t(label)} {...statProps} {...passthrough} />;
});

// TODO better selector / hook
function selectVaultPnlStat(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  pnlData: UserVaultPnl,
  walletAddress: string
) {
  const label = 'VaultStat-Pnl';
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
  const isLoaded = selectIsAnalyticsLoadedByAddress(state, walletAddress);

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
    };
  }

  if (!vaultTimeline || !vaultTimeline.current.length) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
    };
  }

  let value: string, subValue: string | null;
  if (isUserClmPnl(pnlData)) {
    value = formatLargeUsd(pnlData.pnl.withClaimedPending.usd);
    subValue = formatLargePercent(pnlData.pnl.withClaimedPending.percentage);
  } else {
    const { totalPnlUsd, pnlPercentage } = pnlData;
    value = formatLargeUsd(totalPnlUsd);
    subValue = formatLargePercent(pnlPercentage);
  }

  return {
    label,
    value,
    subValue,
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: showClmPnlTooltip(pnlData) ? <ClmPnlTooltipContent userPnl={pnlData} /> : undefined,
  };
}

const selectVaultPnlStatMemoized = createSelector(
  (state: BeefyState) => state,
  (
    _state: BeefyState,
    vaultId: VaultEntity['id'],
    _pnlData: UserVaultPnl,
    _walletAddress: string
  ) => vaultId,
  (
    _state: BeefyState,
    _vaultId: VaultEntity['id'],
    pnlData: UserVaultPnl,
    _walletAddress: string
  ) => pnlData,
  (
    _state: BeefyState,
    _vaultId: VaultEntity['id'],
    _pnlData: UserVaultPnl,
    walletAddress: string
  ) => walletAddress,
  selectVaultPnlStat
);
