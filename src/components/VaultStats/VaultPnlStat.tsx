import { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { formatBigUsd } from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectIsAnalyticsLoaded,
  selectUserDepositedTimelineByVaultId,
  selectVaultPnl,
} from '../../features/data/selectors/analytics';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultPnlStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultDailyStatProps) {
  const label = '-';

  const vaultTimeline = selectUserDepositedTimelineByVaultId(state, vaultId);

  const isLoaded = selectIsAnalyticsLoaded(state);

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

  const { totalPnlUsd } = selectVaultPnl(state, vaultId);

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
