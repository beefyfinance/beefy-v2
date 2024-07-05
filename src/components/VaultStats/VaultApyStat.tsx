import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  type VaultEntity,
} from '../../features/data/entities/vault';
import React, { memo, useMemo } from 'react';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { formatTotalApy } from '../../helpers/format';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat';
import {
  selectIsVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../features/data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../features/data/selectors/apy';
import { selectVaultCurrentBoostIdWithStatus } from '../../features/data/selectors/boosts';
import { useAppSelector } from '../../store';
import type { AllValuesAsString } from '../../features/data/utils/types-utils';
import type { TotalApy } from '../../features/data/reducers/apy';
import { InterestTooltipContent } from '../InterestTooltipContent';
import { getApyComponents, getApyLabelsForType, getApyLabelsTypeForVault } from '../../helpers/apy';
import { useTranslation } from 'react-i18next';

type SelectDataReturn =
  | { status: 'loading' | 'missing' | 'hidden'; type: 'apy' | 'apr' }
  | {
      status: 'available';
      type: 'apy' | 'apr';
      values: TotalApy;
      boosted: 'active' | 'prestake' | undefined;
    };

// TEMP: selector instead of connect/mapStateToProps
function selectData(state: BeefyState, vaultId: VaultEntity['id']): SelectDataReturn {
  const vault = selectVaultById(state, vaultId);
  const type: 'apr' | 'apy' = vault.type === 'gov' ? 'apr' : 'apy';

  const shouldShowInterest = selectVaultShouldShowInterest(state, vaultId);
  if (!shouldShowInterest) {
    return { status: 'hidden', type };
  }

  const isLoaded = selectIsVaultApyAvailable(state, vaultId);
  if (!isLoaded) {
    return { status: 'loading', type };
  }

  const exists = selectDidAPIReturnValuesForVault(state, vaultId);
  if (!exists) {
    return { status: 'missing', type };
  }

  const values = selectVaultTotalApy(state, vaultId);
  const boost = selectVaultCurrentBoostIdWithStatus(state, vaultId);
  if (boost) {
    return { status: 'available', type, values, boosted: boost.status };
  }

  if (!isCowcentratedVault(vault) && !isCowcentratedGovVault(vault)) {
    return { status: 'available', type, values, boosted: undefined };
  }

  return {
    status: 'available',
    type: vault.strategyTypeId === 'compounds' ? 'apy' : 'apr',
    values,
    boosted: 'boostedTotalDaily' in values ? 'active' : undefined,
  };
}

export type VaultApyStatProps = Omit<
  VaultValueStatProps,
  'label' | 'tooltip' | 'value' | 'subValue' | 'blur' | 'loading' | 'boosted'
> & {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
};

export const VaultApyStat = memo<VaultApyStatProps>(function VaultApyStat({
  vaultId,
  type,
  ...rest
}) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectData(state, vaultId));
  const label =
    type === 'daily' ? 'VaultStat-DAILY' : data.type === 'apr' ? 'VaultStat-APR' : 'VaultStat-APY';
  const formatted = useMemo(
    () => (data.status === 'available' ? formatTotalApy(data.values, '???') : undefined),
    [data]
  );
  const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
  const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

  if (data.status == 'loading') {
    return <VaultValueStat label={label} value="-" blur={false} loading={true} {...rest} />;
  }

  if (data.status !== 'available' || !formatted) {
    return (
      <VaultValueStat
        label={label}
        value={data.status === 'hidden' ? '-' : '???'}
        blur={false}
        loading={false}
        {...rest}
      />
    );
  }

  const isBoosted = !!data.boosted || boostedTotalKey in data.values;

  return (
    <VaultValueStat
      label={label}
      value={
        data.boosted === 'prestake'
          ? t('PRE-STAKE')
          : data.boosted === 'active'
          ? formatted[boostedTotalKey]
          : formatted[totalKey]
      }
      subValue={isBoosted ? formatted[totalKey] : undefined}
      tooltip={
        <ApyTooltipContent vaultId={vaultId} type={type} isBoosted={isBoosted} rates={formatted} />
      }
      blur={false}
      loading={false}
      boosted={isBoosted}
      {...rest}
    />
  );
});

type ApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
  isBoosted: boolean;
  rates: AllValuesAsString<TotalApy>;
};

const ApyTooltipContent = memo<ApyTooltipContentProps>(function ApyTooltipContent({
  vaultId,
  type,
  isBoosted,
  rates,
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const rows = useMemo(() => {
    const labels = getApyLabelsForType(getApyLabelsTypeForVault(vault));
    const allComponents = getApyComponents();
    const components = allComponents[type];
    const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

    const items: { label: string | string[]; value: string; last?: boolean }[] = components
      .filter(key => key in rates)
      .map(key => ({
        label: labels[key],
        value: rates[key] ?? '?',
      }));

    items.push({
      label: labels[totalKey],
      value: isBoosted ? rates[boostedTotalKey] ?? '?' : rates[totalKey],
      last: true,
    });

    return items.length ? items : undefined;
  }, [vault, isBoosted, rates, type]);

  return rows ? <InterestTooltipContent rows={rows} /> : undefined;
});
