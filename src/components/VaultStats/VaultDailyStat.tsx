import type { VaultEntity } from '../../features/data/entities/vault';
import React, { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { formatTotalApy } from '../../helpers/format';
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
import type { AllValuesAsString } from '../../features/data/utils/types-utils';
import type { TotalApy } from '../../features/data/reducers/apy';
import { useAppSelector } from '../../store';
import { InterestTooltipContent } from '../InterestTooltipContent';
import { VaultValueStat } from '../VaultValueStat';
import { getApyComponents, getApyLabelsForType } from '../../helpers/apy';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultDailyStat = memo(connect(mapStateToProps)(VaultValueStat));

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

  const values = selectVaultTotalApy(state, vaultId);
  const formatted = formatTotalApy(values, '???');
  const isBoosted = selectIsVaultBoosted(state, vaultId);
  const isPrestake = selectIsVaultPrestakedBoost(state, vaultId);

  return {
    label,
    value: isPrestake
      ? 'PRE-STAKE'
      : isBoosted
      ? formatted.boostedTotalDaily
      : formatted.totalDaily,
    subValue: isBoosted || isPrestake ? formatted.totalDaily : null,
    blur: false,
    loading: !isLoaded,
    boosted: isBoosted || isPrestake,
    shouldTranslate: isPrestake,
    tooltip: <DailyContentTooltip vaultId={vaultId} isBoosted={isBoosted} rates={formatted} />,
    className: className ?? '',
  };
}

type DailyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  isBoosted: boolean;
  rates: AllValuesAsString<TotalApy>;
  className?: string;
};

const DailyContentTooltip = memo<DailyTooltipContentProps>(function DailyTooltip({
  vaultId,
  isBoosted,
  rates,
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const rows = useMemo(() => {
    const labels = getApyLabelsForType(vault.type);
    const { daily } = getApyComponents();

    const items: { label: string | string[]; value: string; last?: boolean }[] = daily
      .filter(key => key in rates)
      .map(key => ({
        label: labels[key],
        value: rates[key] ?? '?',
      }));

    items.push({
      label: labels.totalDaily,
      value: isBoosted ? rates.boostedTotalDaily ?? '?' : rates.totalDaily,
      last: true,
    });

    return items.length ? items : undefined;
  }, [vault.type, isBoosted, rates]);

  return rows ? <InterestTooltipContent rows={rows} /> : undefined;
});
