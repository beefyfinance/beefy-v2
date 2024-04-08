import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import {
  formatTokenDisplayCondensed,
  formatTokenDisplay,
  formatLargeUsd,
} from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';
import type { VaultPnLDataType } from './types';
import { selectIsVaultCowcentrated } from '../../features/data/selectors/vaults';

export type VaultNowStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: VaultPnLDataType;
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

  const { deposit, depositUsd, tokenDecimals } = pnlData;

  return {
    label,
    value: formatTokenDisplayCondensed(deposit, tokenDecimals),
    subValue: formatLargeUsd(depositUsd),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: <BasicTooltipContent title={formatTokenDisplay(deposit, tokenDecimals)} />,
    className: className ?? '',
  };
}
