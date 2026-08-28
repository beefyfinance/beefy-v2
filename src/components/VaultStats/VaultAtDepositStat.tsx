import { memo } from 'react';
import { isEqual } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { isUserClmPnl, type UserVaultPnl } from '../../features/data/selectors/analytics-types.ts';
import { selectUserDepositedTimelineByVaultId } from '../../features/data/selectors/analytics.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent.tsx';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { useTranslation } from 'react-i18next';
import { selectIsAnalyticsLoadedByAddress } from '../../features/data/selectors/data-loader/analytics.ts';

export type VaultAtDepositStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: UserVaultPnl;
  walletAddress: string;
} & Omit<
  VaultValueStatProps,
  'label' | 'loading' | 'value' | 'subValue' | 'tooltip' | 'blur' | 'expectSubValue'
>;

export const VaultAtDepositStat = memo(function VaultAtDepositStat({
  vaultId,
  pnlData,
  walletAddress,
  ...passthrough
}: VaultAtDepositStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, tooltip, ...statProps } = useAppSelector(state =>
    selectVaultAtDepositStat(state, vaultId, pnlData, walletAddress)
  );
  return (
    <VaultValueStat
      label={t(label)}
      tooltip={tooltip ? <BasicTooltipContent title={tooltip} /> : undefined}
      {...statProps}
      {...passthrough}
    />
  );
});

const selectVaultAtDepositStat = createCachedSelector(
  (state: BeefyState) => state,
  (_s: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (_s: BeefyState, _v: VaultEntity['id'], pnlData: UserVaultPnl) => pnlData,
  (_s: BeefyState, _v: VaultEntity['id'], _p: UserVaultPnl, walletAddress: string) => walletAddress,
  (state: BeefyState, vaultId: VaultEntity['id'], pnlData: UserVaultPnl, walletAddress: string) => {
    const label = 'VaultStat-AtDeposit';
    const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
    const isLoaded = selectIsAnalyticsLoadedByAddress(state, walletAddress);

    if (!vaultTimeline || !vaultTimeline.current.length) {
      return {
        label,
        value: '-',
        subValue: null,
        blur: false,
        loading: false,
      };
    }

    if (!isLoaded) {
      return {
        label,
        value: '-',
        subValue: null,
        blur: false,
        loading: true,
        expectSubValue: true,
      };
    }

    let value: string, subValue: string, tooltip: string;
    if (isUserClmPnl(pnlData)) {
      value = formatTokenDisplayCondensed(
        pnlData.underlying.entry.amount,
        pnlData.underlying.token.decimals,
        6
      );
      subValue = formatLargeUsd(pnlData.underlying.entry.usd);
      tooltip = formatTokenDisplay(
        pnlData.underlying.entry.amount,
        pnlData.underlying.token.decimals
      );
    } else {
      const { balanceAtDeposit, usdBalanceAtDeposit, tokenDecimals } = pnlData;
      value = formatTokenDisplayCondensed(balanceAtDeposit, tokenDecimals, 6);
      subValue = formatLargeUsd(usdBalanceAtDeposit);
      tooltip = formatTokenDisplay(balanceAtDeposit, tokenDecimals);
    }

    return {
      label,
      value,
      subValue,
      blur: false,
      loading: !isLoaded,
      boosted: false,
      tooltip,
    };
  },
  { memoizeOptions: { resultEqualityCheck: isEqual } }
)(
  (_s: BeefyState, vaultId: VaultEntity['id'], _p: UserVaultPnl, walletAddress: string) =>
    `${vaultId}-${walletAddress}`
);
