import { memo } from 'react';
import { LabeledStat } from '../LabeledStat';
import { useTranslation } from 'react-i18next';
import { formatTotalApy } from '../../helpers/format';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../features/data/selectors/apy';
import type { VaultEntity } from '../../features/data/entities/vault';
import { isGovVault, shouldVaultShowInterest } from '../../features/data/entities/vault';
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectIsVaultApyAvailable } from '../../features/data/selectors/data-loader';
import type { TotalApy } from '../../features/data/reducers/apy';
import type { AllValuesAsString } from '../../features/data/utils/types-utils';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';
import { InterestTooltipContent } from '../InterestTooltipContent';
import {
  type ApyLabelsType,
  getApyComponents,
  getApyLabelsForType,
  getApyLabelsTypeForVault,
} from '../../helpers/apy';

const _YearlyBreakdownTooltip = ({
  type,
  boosted,
  rates,
}: {
  type: ApyLabelsType;
  boosted: boolean;
  // here we get formatted values
  rates: AllValuesAsString<TotalApy>;
}) => {
  const { t } = useTranslation();
  const labels = getApyLabelsForType(type);
  const { yearly } = getApyComponents();

  const rows: { label: string; value: string; last?: boolean }[] = yearly
    .filter(key => key in rates)
    .map(key => ({
      label: t(labels[key]),
      value: rates[key] ?? '?',
    }));

  rows.push({
    label: t(labels.totalApy),
    value: boosted ? rates.boostedTotalApy ?? '?' : rates.totalApy,
    last: true,
  });

  return <InterestTooltipContent rows={rows} />;
};

const YearlyBreakdownTooltip = memo(_YearlyBreakdownTooltip);

const _DailyBreakdownTooltip = ({
  type,
  boosted,
  rates,
}: {
  type: ApyLabelsType;
  boosted: boolean;
  // here we get formatted values
  rates: AllValuesAsString<TotalApy>;
}) => {
  const { t } = useTranslation();
  const labels = getApyLabelsForType(type);
  const { daily } = getApyComponents();

  const rows: { label: string; value: string; last?: boolean }[] = daily
    .filter(key => key in rates)
    .map(key => ({
      label: t(labels[key]),
      value: rates[key] ?? '?',
    }));

  rows.push({
    label: t(labels.totalDaily),
    value: boosted ? rates.boostedTotalDaily ?? '?' : rates.totalDaily,
    last: true,
  });

  return <InterestTooltipContent rows={rows} />;
};

const DailyBreakdownTooltip = memo(_DailyBreakdownTooltip);

function _YearlyApyStats({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const { t } = useTranslation();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));
  const shouldShowApy = shouldVaultShowInterest(vault);

  const isLoading = useAppSelector(
    state =>
      // sometimes, the api skips some vaults, for now, we consider the vault loading
      !selectIsVaultApyAvailable(state, vaultId) ||
      !selectDidAPIReturnValuesForVault(state, vaultId)
  );
  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));

  const formatted = formatTotalApy(values);

  return (
    <ValueBlock
      label={isGovVault(vault) ? t('APR') : t('APY')}
      textContent={false}
      value={
        <LabeledStat
          boosted={isBoosted && shouldShowApy ? formatted.boostedTotalApy : null}
          value={shouldShowApy ? formatted.totalApy : '-'}
        />
      }
      tooltip={
        shouldShowApy
          ? {
              content: (
                <YearlyBreakdownTooltip
                  type={getApyLabelsTypeForVault(vault)}
                  boosted={isBoosted}
                  rates={formatted}
                />
              ),
            }
          : undefined
      }
      loading={shouldShowApy && isLoading}
    />
  );
}

export const YearlyApyStats = memo(_YearlyApyStats);

function _DailyApyStats({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const { t } = useTranslation();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));
  const shouldShowApy = shouldVaultShowInterest(vault);

  const isLoading = useAppSelector(
    state =>
      // sometimes, the api skips some vaults, for now, we consider the vault loading
      !selectIsVaultApyAvailable(state, vaultId) ||
      !selectDidAPIReturnValuesForVault(state, vaultId)
  );
  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));

  const formatted = formatTotalApy(values);

  return (
    <ValueBlock
      label={t('Vault-Daily')}
      textContent={false}
      value={
        <LabeledStat
          boosted={isBoosted && shouldShowApy ? formatted.boostedTotalDaily : null}
          value={shouldShowApy ? formatted.totalDaily : '-'}
        />
      }
      tooltip={
        shouldShowApy
          ? {
              content: (
                <DailyBreakdownTooltip
                  type={getApyLabelsTypeForVault(vault)}
                  boosted={isBoosted}
                  rates={formatted}
                />
              ),
            }
          : undefined
      }
      loading={shouldShowApy && isLoading}
    />
  );
}

export const DailyApyStats = memo(_DailyApyStats);
