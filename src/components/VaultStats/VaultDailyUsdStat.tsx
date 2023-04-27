import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import {
  formatBigUsd,
  formatFullBigNumber,
  formatSignificantBigNumber,
} from '../../helpers/format';
import {
  selectVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../features/data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultDailyYieldStats,
} from '../../features/data/selectors/apy';
import { VaultValueStat } from '../VaultValueStat';
import { BasicTooltipContent } from '../Tooltip/BasicTooltipContent';

export type VaultDailyUsdStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
  triggerClassName?: string;
};

export const VaultDailyUsdStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(
  state: BeefyState,
  { vaultId, className, triggerClassName }: VaultDailyUsdStatProps
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

  const { dailyTokens, dailyUsd, oraclePrice, tokenDecimals } = selectVaultDailyYieldStats(
    state,
    vaultId
  );

  return {
    label,
    value: formatSignificantBigNumber(dailyTokens, tokenDecimals, oraclePrice, 0, 2),
    subValue: formatBigUsd(dailyUsd),
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: <BasicTooltipContent title={formatFullBigNumber(dailyTokens, tokenDecimals)} />,
    className: className ?? '',
    triggerClassName: triggerClassName ?? '',
  };
}
