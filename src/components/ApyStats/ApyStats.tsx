import { memo } from 'react';
import { LabeledStat } from '../LabeledStat';
import { useTranslation } from 'react-i18next';
import { formattedTotalApy } from '../../helpers/format';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../features/data/selectors/apy';
import {
  isGovVault,
  shouldVaultShowInterest,
  VaultEntity,
} from '../../features/data/entities/vault';
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectVaultApyAvailable } from '../../features/data/selectors/data-loader';
import { TotalApy } from '../../features/data/reducers/apy';
import { AllValuesAsString } from '../../features/data/utils/types-utils';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { InterestTooltipContent } from '../../features/home/components/Vault/components/InterestTooltipContent';
import { useAppSelector } from '../../store';

const _YearlyBreakdownTooltip = ({
  isGovVault,
  boosted,
  rates,
}: {
  isGovVault: boolean;
  boosted: boolean;
  // here we get formatted values
  rates: AllValuesAsString<TotalApy>;
}) => {
  const rows = [];
  const { t } = useTranslation();

  if (isGovVault) {
    rows.push({
      label: t('Pool-Apr'),
      value: rates.vaultApr,
      last: true,
    });
    return <InterestTooltipContent rows={rows} />;
  }

  if ('vaultApr' in rates) {
    rows.push({
      label: t('Vault-Breakdown-VaultApr'),
      value: rates.vaultApr,
      last: false,
    });
  }

  if ('tradingApr' in rates) {
    rows.push({
      label: t('Vault-Breakdown-TradingApr'),
      value: rates.tradingApr,
      last: false,
    });
  }

  if ('liquidStakingApr' in rates) {
    rows.push({
      label: t('Vault-Breakdown-LiquidStakingApr'),
      value: rates.liquidStakingApr,
      last: false,
    });
  }

  if ('composablePoolApr' in rates) {
    rows.push({
      label: t('Vault-Breakdown-ComposablePoolApr'),
      value: rates.composablePoolApr,
      last: false,
    });
  }

  if ('boostApr' in rates) {
    rows.push({
      label: t('Vault-Breakdown-BoostApr'),
      value: rates.boostApr,
      last: false,
    });
  }

  rows.push({
    label: t('APY'),
    value: boosted ? rates.boostedTotalApy : rates.totalApy,
    last: true,
  });

  return <InterestTooltipContent rows={rows} />;
};

const YearlyBreakdownTooltip = memo(_YearlyBreakdownTooltip);

const _DailyBreakdownTooltip = ({
  isGovVault,
  boosted,
  rates,
}: {
  isGovVault: boolean;
  boosted: boolean;
  // here we get formatted values
  rates: AllValuesAsString<TotalApy>;
}) => {
  const rows = [];
  const { t } = useTranslation();

  if (isGovVault) {
    rows.push({
      label: t('Pool-AprDaily'),
      value: rates.vaultDaily,
      last: true,
    });
    return <InterestTooltipContent rows={rows} />;
  }

  if ('vaultDaily' in rates) {
    rows.push({
      label: t('Vault-Breakdown-VaultDaily'),
      value: rates.vaultDaily,
      last: false,
    });
  }

  if ('tradingDaily' in rates) {
    rows.push({
      label: t('Vault-Breakdown-TradingDaily'),
      value: rates.tradingDaily,
      last: false,
    });
  }

  if ('liquidStakingDaily' in rates) {
    rows.push({
      label: t('Vault-Breakdown-LiquidStakingDaily'),
      value: rates.liquidStakingDaily,
      last: false,
    });
  }

  if ('composablePoolDaily' in rates) {
    rows.push({
      label: t('Vault-Breakdown-ComposablePoolDaily'),
      value: rates.composablePoolDaily,
      last: false,
    });
  }

  if ('boostDaily' in rates) {
    rows.push({
      label: t('Vault-Breakdown-BoostDaily'),
      value: rates.boostDaily,
      last: false,
    });
  }

  rows.push({
    label: t('Vault-Breakdown-DailyAPY'),
    value: boosted ? rates.boostedTotalDaily : rates.totalDaily,
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
      !selectVaultApyAvailable(state, vaultId) || !selectDidAPIReturnValuesForVault(state, vaultId)
  );
  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));

  const formatted = formattedTotalApy(values);

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
                  isGovVault={isGovVault(vault)}
                  boosted={isBoosted}
                  rates={formatted}
                />
              ),
            }
          : null
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
      !selectVaultApyAvailable(state, vaultId) || !selectDidAPIReturnValuesForVault(state, vaultId)
  );
  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));

  const formatted = formattedTotalApy(values);

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
                  isGovVault={isGovVault(vault)}
                  boosted={isBoosted}
                  rates={formatted}
                />
              ),
            }
          : null
      }
      loading={shouldShowApy && isLoading}
    />
  );
}

export const DailyApyStats = memo(_DailyApyStats);
