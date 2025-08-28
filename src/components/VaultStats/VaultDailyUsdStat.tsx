import { createCachedSelector } from 're-reselect';
import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectDidAPIReturnValuesForVault,
  selectIsVaultApyAvailable,
  selectYieldStatsByVaultId,
} from '../../features/data/selectors/apy.ts';
import { selectVaultShouldShowInterest } from '../../features/data/selectors/vaults.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { useTranslation } from 'react-i18next';

export type VaultDailyUsdStatProps = {
  vaultId: VaultEntity['id'];
  walletAddress?: string;
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultDailyUsdStatMemoized>>;

export const VaultDailyUsdStat = memo(function ({
  vaultId,
  walletAddress,
  ...passthrough
}: VaultDailyUsdStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, ...statProps } = useAppSelector(state =>
    selectVaultDailyUsdStatMemoized(state, vaultId, walletAddress)
  );
  return <VaultValueStat label={t(label)} {...statProps} {...passthrough} />;
});

const selectVaultDailyUsdStatMemoized = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
    selectVaultShouldShowInterest(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
    selectIsVaultApyAvailable(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) =>
    selectDidAPIReturnValuesForVault(state, vaultId),
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    selectYieldStatsByVaultId(state, vaultId, walletAddress),
  (shouldShowInterest, isLoaded, haveValues, yieldStats) => {
    const label = 'Dashboard-Filter-DailyYield';

    if (!shouldShowInterest) {
      return {
        label,
        value: '-',
        subValue: null,
        blur: false,
        loading: false,
      };
    }

    if (!isLoaded) {
      return {
        label,
        value: '-',
        subValue: null,
        blur: false,
        loading: true,
      };
    }

    if (!haveValues) {
      return {
        label,
        value: '???',
        subValue: null,
        blur: false,
        loading: false,
      };
    }

    const { dailyUsd } = yieldStats;

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
)((_state: BeefyState, vaultId: VaultEntity['id'], _walletAddress?: string) => vaultId);
