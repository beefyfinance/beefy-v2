import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { formatBigUsd } from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoadedByAddress,
  selectUserDepositedTimelineByVaultId,
} from '../../features/data/selectors/analytics';
import type { VaultPnLDataType } from './types';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  pnlData: VaultPnLDataType;
  walletAddress: string;
};

export const VaultPnlStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, pnlData, walletAddress }: VaultDailyStatProps
) {
  const label = '-';

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

  const { totalPnlUsd } = pnlData;

  return {
    label,
    value: formatBigUsd(totalPnlUsd),
    subValue: null,
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: null,
    className: className ?? '',
  };
}
