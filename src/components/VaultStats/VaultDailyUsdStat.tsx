import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { formatLargeUsd } from '../../helpers/format';
import {
  selectVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../features/data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultDailyYieldStats,
} from '../../features/data/selectors/apy';
import { VaultValueStat } from '../VaultValueStat';

export type VaultDailyUsdStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  triggerClassName?: string;
  walletAddress?: string;
};

export const VaultDailyUsdStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, triggerClassName, walletAddress }: VaultDailyUsdStatProps
) {
  const label = 'Dashboard-Filter-DailyYield';

  const shouldShowInterest = selectVaultShouldShowInterest(state, vaultId);
  if (!shouldShowInterest) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
      className: className ?? '',
    };
  }

  const isLoaded = selectVaultApyAvailable(state, vaultId);
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

  const haveValues = selectDidAPIReturnValuesForVault(state, vaultId);
  if (!haveValues) {
    return {
      label,
      value: '???',
      subValue: null,
      blur: false,
      loading: false,
      className: className ?? '',
    };
  }

  const { dailyUsd } = selectVaultDailyYieldStats(state, vaultId, walletAddress);

  return {
    label,
    value: formatLargeUsd(dailyUsd),
    subValue: null,
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: null,
    className: className ?? '',
    triggerClassName: triggerClassName ?? '',
  };
}
