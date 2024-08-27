import type { VaultEntity } from '../../features/data/entities/vault';
import { memo, type ReactNode } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import {
  formatLargeUsd,
  formatTokenDisplay,
  formatTokenDisplayCondensed,
} from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import { isUserClmPnl, type UserVaultPnl } from '../../features/data/selectors/analytics-types';

export type VaultNowStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: UserVaultPnl;
  walletAddress: string;
};

export const VaultNowStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, pnlData, walletAddress }: VaultNowStatProps
) {
  const label = 'VaultStat-Now';
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
  const isLoaded = selectIsAnalyticsLoadedByAddress(state, walletAddress);

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
      className: className ?? '',
    };
  }

  if (!vaultTimeline || !vaultTimeline.current.length) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
      className: className ?? '',
    };
  }

  let value: string, subValue: string, tooltip: ReactNode;
  if (isUserClmPnl(pnlData)) {
    value = formatTokenDisplayCondensed(
      pnlData.underlying.now.amount,
      pnlData.underlying.token.decimals
    );
    subValue = formatLargeUsd(pnlData.underlying.now.usd);
    tooltip = (
      <BasicTooltipContent
        title={formatTokenDisplay(pnlData.underlying.now.amount, pnlData.underlying.token.decimals)}
      />
    );
  } else {
    const { deposit, depositUsd, tokenDecimals } = pnlData;
    value = formatTokenDisplayCondensed(deposit, tokenDecimals);
    subValue = formatLargeUsd(depositUsd);
    tooltip = <BasicTooltipContent title={formatTokenDisplay(deposit, tokenDecimals)} />;
  }

  return {
    label,
    value,
    subValue,
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip,
    className: className ?? '',
  };
}
