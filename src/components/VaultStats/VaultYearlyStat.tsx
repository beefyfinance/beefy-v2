import type { VaultEntity } from '../../features/data/entities/vault';
import React, { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectIsVaultGov, selectVaultById } from '../../features/data/selectors/vaults';
import { formatTotalApy } from '../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../features/data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../features/data/selectors/apy';
import {
  selectIsVaultBoosted,
  selectIsVaultPrestakedBoost,
} from '../../features/data/selectors/boosts';
import { useAppSelector } from '../../store';
import type { AllValuesAsString } from '../../features/data/utils/types-utils';
import type { TotalApy } from '../../features/data/reducers/apy';
import { InterestTooltipContent } from '../InterestTooltipContent';
import { getApyComponents, getApyLabelsForType } from '../../helpers/apy';

export type VaultYearlyStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultYearlyStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultYearlyStatProps) {
  const isGovVault = selectIsVaultGov(state, vaultId);
  const label = isGovVault ? 'VaultStat-APR' : 'VaultStat-APY';

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

  const isLoaded = selectVaultApyAvailable(state, vaultId);
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

  const values = selectVaultTotalApy(state, vaultId);
  const formatted = formatTotalApy(values, '???');
  const isBoosted = selectIsVaultBoosted(state, vaultId);
  const isPrestake = selectIsVaultPrestakedBoost(state, vaultId);

  return {
    label,
    value: isPrestake ? 'PRE-STAKE' : isBoosted ? formatted.boostedTotalApy : formatted.totalApy,
    subValue: isBoosted || isPrestake ? formatted.totalApy : null,
    blur: false,
    loading: !isLoaded,
    boosted: isBoosted || isPrestake,
    shouldTranslate: isPrestake,
    tooltip: <YearlyTooltipContent vaultId={vaultId} isBoosted={isBoosted} rates={formatted} />,
  };
}

type YearlyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  isBoosted: boolean;
  rates: AllValuesAsString<TotalApy>;
};

const YearlyTooltipContent = memo<YearlyTooltipContentProps>(function YearlyTooltip({
  vaultId,
  isBoosted,
  rates,
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const rows = useMemo(() => {
    const labels = getApyLabelsForType(vault.type);
    const { yearly } = getApyComponents();

    const items: { label: string | string[]; value: string; last?: boolean }[] = yearly
      .filter(key => key in rates)
      .map(key => ({
        label: labels[key],
        value: rates[key] ?? '?',
      }));

    items.push({
      label: labels.totalApy,
      value: isBoosted ? rates.boostedTotalApy ?? '?' : rates.totalApy,
      last: true,
    });

    return items.length ? items : undefined;
  }, [vault.type, isBoosted, rates]);

  return rows ? <InterestTooltipContent rows={rows} /> : undefined;
});
