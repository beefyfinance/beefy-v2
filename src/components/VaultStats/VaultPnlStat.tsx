import { createCachedSelector } from 're-reselect';
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
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultPnlStat>>;

export const VaultPnlStat = memo(function ({
  vaultId,
  pnlData,
  walletAddress,
  ...passthrough
}: VaultDailyStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, ...statProps } = useAppSelector(state =>
    selectVaultPnlStat(state, vaultId, pnlData, walletAddress)
  );
  return <VaultValueStat label={t(label)} {...statProps} {...passthrough} />;
});

const selectVaultPnlStat = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], _pnlData: UserVaultPnl, walletAddress: string) =>
    selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress),
  (state: BeefyState, _vaultId: VaultEntity['id'], _pnlData: UserVaultPnl, walletAddress: string) =>
    selectIsAnalyticsLoadedByAddress(state, walletAddress),
  (
    _state: BeefyState,
    _vaultId: VaultEntity['id'],
    pnlData: UserVaultPnl,
    _walletAddress: string
  ) => pnlData,
  (vaultTimeline, isLoaded, pnlData) => {
    const label = 'VaultStat-Pnl';

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
)(
  (
    _state: BeefyState,
    vaultId: VaultEntity['id'],
    _pnlData: UserVaultPnl,
    _walletAddress: string
  ) => vaultId
);
