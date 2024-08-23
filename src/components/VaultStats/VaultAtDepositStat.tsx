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

export type VaultAtDepositStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: UserVaultPnl;
  walletAddress: string;
};

export const VaultAtDepositStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, pnlData, walletAddress }: VaultAtDepositStatProps
) {
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

  let value: string, subValue: string, tooltip: ReactNode;
  if (isUserClmPnl(pnlData)) {
    const { underlyingAtDeposit, underlyingAtDepositInUsd } = pnlData;
    value = formatTokenDisplayCondensed(underlyingAtDeposit, 18);
    subValue = formatLargeUsd(underlyingAtDepositInUsd);
    tooltip = <BasicTooltipContent title={formatTokenDisplay(underlyingAtDeposit, 18)} />;
  } else {
    const { balanceAtDeposit, usdBalanceAtDeposit, tokenDecimals } = pnlData;
    value = formatTokenDisplayCondensed(balanceAtDeposit, tokenDecimals);
    subValue = formatLargeUsd(usdBalanceAtDeposit);
    tooltip = <BasicTooltipContent title={formatTokenDisplay(balanceAtDeposit, tokenDecimals)} />;
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
