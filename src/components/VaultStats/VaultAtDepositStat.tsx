import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
  formatTokenDisplay,
} from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import type { VaultPnLDataType } from './types';

export type VaultAtDepositStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: VaultPnLDataType;
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

  const { balanceAtDeposit, usdBalanceAtDeposit, tokenDecimals } = pnlData;

  return {
    label,
    value: formatTokenDisplayCondensed(balanceAtDeposit, tokenDecimals),
    subValue: formatLargeUsd(usdBalanceAtDeposit),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: <BasicTooltipContent title={formatTokenDisplay(balanceAtDeposit, tokenDecimals)} />,
    className: className ?? '',
  };
}
