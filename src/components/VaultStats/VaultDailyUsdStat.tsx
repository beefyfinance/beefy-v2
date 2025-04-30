import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectDidAPIReturnValuesForVault,
  selectYieldStatsByVaultId,
} from '../../features/data/selectors/apy.ts';
import {
  selectIsVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../features/data/selectors/data-loader.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import type { BeefyState } from '../../redux-types.ts';
import { useAppSelector } from '../../store.ts';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';

export type VaultDailyUsdStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultDailyUsdStat>>;

export const VaultDailyUsdStat = memo(function ({
  vaultId,
  walletAddress,
  ...passthrough
}: VaultDailyUsdStatProps) {
  // @dev don't do this - temp migration away from connect()
  const props = useAppSelector(state => selectVaultDailyUsdStat(state, vaultId, walletAddress));
  return <VaultValueStat {...props} {...passthrough} />;
});

// TODO better selector / hook
function selectVaultDailyUsdStat(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
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
    };
  }

  const isLoaded = selectIsVaultApyAvailable(state, vaultId);
  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
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
    };
  }

  const { dailyUsd } = selectYieldStatsByVaultId(state, vaultId, walletAddress);

  return {
    label,
    value: formatLargeUsd(dailyUsd),
    subValue: null,
    blur: false,
    loading: !isLoaded,
    boosted: false,
    tooltip: null,
  };
}
