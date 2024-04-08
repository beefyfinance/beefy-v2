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
import { selectIsVaultCowcentrated } from '../../features/data/selectors/vaults';

export type VaultYieldStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: VaultPnLDataType;
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

  const isCowcentratedVault = selectIsVaultCowcentrated(state, vaultId);

  if (!vaultTimeline || isCowcentratedVault) {
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

  const { totalYield, totalYieldUsd, tokenDecimals } = pnlData;

  return {
    label,
    value: formatTokenDisplayCondensed(totalYield, tokenDecimals),
    tooltip: <BasicTooltipContent title={formatTokenDisplay(totalYield, tokenDecimals)} />,
    subValue: formatLargeUsd(totalYieldUsd),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    className: className ?? '',
  };
}
