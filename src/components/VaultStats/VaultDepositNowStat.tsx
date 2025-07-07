import { memo, type ReactNode } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { isUserClmPnl, type UserVaultPnl } from '../../features/data/selectors/analytics-types.ts';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics.ts';
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
import ExclaimRoundedSquare from '../../images/icons/exclaim-rounded-square.svg?react';

export type VaultDepositNowStatProps = {
  vaultId: VaultEntity['id'];
  pnlData: UserVaultPnl;
  walletAddress: string;
} & Omit<
  VaultValueStatProps,
  'label' | 'loading' | 'value' | 'subValue' | 'tooltip' | 'blur' | 'expectSubValue'
>;

export const VaultDepositNowStat = memo(function VaultDepositNowStat({
  vaultId,
  pnlData,
  walletAddress,
  ...passthrough
}: VaultDepositNowStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, tooltip, ...statProps } = useAppSelector(state =>
    selectVaultDepositNowStat(state, vaultId, pnlData, walletAddress)
  );
  const tooltipContent: undefined | ReactNode =
    tooltip?.type === 'amount' ? <BasicTooltipContent title={tooltip.balance} />
    : tooltip?.type === 'pending-index' ?
      <BasicTooltipContent
        title={t('VaultStat-Now-Tooltip-PendingIndex-Title')}
        content={t('VaultStat-Now-Tooltip-PendingIndex-Content', tooltip)}
      />
    : undefined;

  return (
    <VaultValueStat label={t(label)} tooltip={tooltipContent} {...statProps} {...passthrough} />
  );
});

// TODO better selector / hook
const selectVaultDepositNowStat = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  pnlData: UserVaultPnl,
  walletAddress: string
) => {
  const label = 'VaultStat-Now';
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

  let value: string,
    subValue: string,
    tooltip:
      | undefined
      | { type: 'amount'; balance: string }
      | {
          type: 'pending-index';
          indexedBalance: string;
          onchainBalance: string;
        },
    pendingIndex = false;
  if (isUserClmPnl(pnlData)) {
    pendingIndex = pnlData.pendingIndex;
    value = formatTokenDisplayCondensed(
      pnlData.underlying.now.amount,
      pnlData.underlying.token.decimals,
      6
    );
    subValue = formatLargeUsd(pnlData.underlying.now.usd);
    tooltip = {
      type: 'amount',
      balance: formatTokenDisplay(pnlData.underlying.now.amount, pnlData.underlying.token.decimals),
    };
    if (pendingIndex) {
      tooltip = {
        type: 'pending-index',
        onchainBalance: formatTokenDisplay(
          pnlData.underlying.live.amount,
          pnlData.underlying.token.decimals
        ),
        indexedBalance: formatTokenDisplay(
          pnlData.underlying.now.amount,
          pnlData.underlying.token.decimals
        ),
      };
    }
  } else {
    const { deposit, depositUsd, depositLive, tokenDecimals } = pnlData;
    pendingIndex = pnlData.pendingIndex;
    value = formatTokenDisplayCondensed(deposit, tokenDecimals, 6);
    subValue = formatLargeUsd(depositUsd);
    tooltip = { type: 'amount', balance: formatTokenDisplay(deposit, tokenDecimals) };
    if (pendingIndex) {
      tooltip = {
        type: 'pending-index',
        onchainBalance: formatTokenDisplay(depositLive, tokenDecimals),
        indexedBalance: formatTokenDisplay(deposit, tokenDecimals),
      };
    }
  }

  return {
    label,
    value,
    subValue,
    blur: false,
    loading: !isLoaded,
    tooltip,
    Icon: pendingIndex ? ExclaimRoundedSquare : undefined,
  };
};
