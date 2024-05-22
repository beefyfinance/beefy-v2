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

export type VaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: UserVaultPnl;
  walletAddress: string;
};

export const VaultYieldStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, pnlData, walletAddress }: VaultYieldStatProps
) {
  const label = 'VaultStat-Yield';
  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress);
  const isLoaded = selectIsAnalyticsLoadedByAddress(state, walletAddress);

  if (!vaultTimeline) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
      className: className ?? '',
    };
  }
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

  let value: string, subValue: string | null, tooltip: ReactNode | null;
  if (isUserClmPnl(pnlData)) {
    value = 'N/A';
    subValue = null;
    tooltip = null;
  } else {
    const { totalYield, totalYieldUsd, tokenDecimals } = pnlData;
    value = formatTokenDisplayCondensed(totalYield, tokenDecimals);
    tooltip = <BasicTooltipContent title={formatTokenDisplay(totalYield, tokenDecimals)} />;
    subValue = formatLargeUsd(totalYieldUsd);
  }

  return {
    label,
    value,
    tooltip,
    subValue,
    blur: false,
    loading: !isLoaded,
    boosted: false,
    className: className ?? '',
  };
}
