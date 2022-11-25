import { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { formatBigUsd } from '../../helpers/format';
import { VaultValueStat } from '../../features/home/components/Vault/components/VaultValueStat';
import {
  selectVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../features/data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultDailyYieldStats,
} from '../../features/data/selectors/apy';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultDailyUsdStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultDailyStatProps) {
  const label = 'VaultStat-DAILY';

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

  const dailyInfo = selectVaultDailyYieldStats(state, vaultId);

  return {
    label,
    value: dailyInfo.dailyTokens.toFixed(2),
    subValue: formatBigUsd(dailyInfo.dailyUsd),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: null,
    className: className ?? '',
  };
}
