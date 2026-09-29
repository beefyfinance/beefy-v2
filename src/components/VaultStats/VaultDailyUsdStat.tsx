import { createSelector } from '@reduxjs/toolkit';
import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectDashboardRateVaultId,
  selectDashboardRateVaultIds,
  selectDashboardRowDailyUsd,
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
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultDailyUsdStat>>;

export const VaultDailyUsdStat = memo(function ({
  vaultId,
  walletAddress,
  ...passthrough
}: VaultDailyUsdStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, ...statProps } = useAppSelector(state =>
    selectVaultDailyUsdStat(state, vaultId, walletAddress)
  );
  return <VaultValueStat label={t(label)} {...statProps} {...passthrough} />;
});

const LABEL = 'Dashboard-Filter-DailyYield';
const NO_INTEREST = { label: LABEL, value: '-', subValue: null, blur: false, loading: false };
const APY_LOADING = { label: LABEL, value: '-', subValue: null, blur: false, loading: true };
const NO_API_VALUES = { label: LABEL, value: '???', subValue: null, blur: false, loading: false };

const selectDailyUsdStatus = (state: BeefyState, vaultId: VaultEntity['id']) =>
  !selectVaultShouldShowInterest(state, vaultId) ? 'no-interest'
  : !selectIsVaultApyAvailable(state, vaultId) ? 'loading'
  : !selectDidAPIReturnValuesForVault(state, vaultId) ? 'no-api-values'
  : 'ok';

/** a dashboard CLM row is only as ready as its least ready earning side */
const selectRowDailyUsdStatus = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  walletAddress?: string
) => {
  if (!walletAddress) {
    return selectDailyUsdStatus(state, vaultId);
  }
  const ids = selectDashboardRateVaultIds(state, vaultId, walletAddress);
  const statuses = (
    ids.length ? ids : [selectDashboardRateVaultId(state, vaultId, walletAddress)]).map(id =>
    selectDailyUsdStatus(state, id)
  );
  return statuses.find(status => status !== 'ok') ?? 'ok';
};

const selectVaultDailyUsdStat = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    selectRowDailyUsdStatus(state, vaultId, walletAddress),
  (state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string) =>
    selectRowDailyUsdStatus(state, vaultId, walletAddress) !== 'ok' ? undefined
    : walletAddress ? selectDashboardRowDailyUsd(state, vaultId, walletAddress)
    : selectYieldStatsByVaultId(state, vaultId).dailyUsd,
  (status, dailyUsd) => {
    if (status === 'no-interest') {
      return NO_INTEREST;
    }

    if (status === 'loading') {
      return APY_LOADING;
    }

    if (status === 'no-api-values' || dailyUsd === undefined) {
      return NO_API_VALUES;
    }

    return {
      label: LABEL,
      value: formatLargeUsd(dailyUsd),
      subValue: null,
      blur: false,
      loading: false,
      boosted: false,
      tooltip: null,
    };
  }
);
