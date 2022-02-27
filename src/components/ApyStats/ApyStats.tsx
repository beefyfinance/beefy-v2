import { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { LabeledStat } from '../../features/home/components/LabeledStat';
import { Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formattedTotalApy } from '../../helpers/format';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../features/data/selectors/apy';
import { isGovVault, VaultEntity } from '../../features/data/entities/vault';
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectVaultApyAvailable } from '../../features/data/selectors/data-loader';
import { TotalApy } from '../../features/data/reducers/apy';
import { AllValuesAsString } from '../../features/data/utils/types-utils';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const useStyles = makeStyles(styles as any);

const BreakdownTooltip = memo(({ rows }: any) => {
  const classes = useStyles();

  return (
    <>
      {rows.map(row => (
        <Box className={classes.rows} key={row.label}>
          <div className={row.last ? classes.bold : classes.statLabel}>{row.label}</div>
          <div className={row.last ? classes.bold : classes.value}>{row.value}</div>
        </Box>
      ))}
    </>
  );
});

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
    return <BreakdownTooltip rows={rows} />;
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

  return <BreakdownTooltip rows={rows} />;
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
    return <BreakdownTooltip rows={rows} />;
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

  return <BreakdownTooltip rows={rows} />;
};

const DailyBreakdownTooltip = memo(_DailyBreakdownTooltip);

function _YearlyApyStats({
  vaultId,
  variant,
}: {
  vaultId: VaultEntity['id'];
  variant: 'small' | 'large';
}) {
  const { t } = useTranslation();

  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));

  const isLoading = useSelector(
    (state: BeefyState) =>
      // sometimes, the api skips some vaults, for now, we consider the vault loading
      !selectVaultApyAvailable(state, vaultId) || selectDidAPIReturnValuesForVault(state, vaultId)
  );
  const values = useSelector((state: BeefyState) => selectVaultTotalApy(state, vaultId));

  const formatted = formattedTotalApy(values);

  return (
    <ValueBlock
      label={isGovVault(vault) ? t('APR') : t('APY')}
      textContent={false}
      value={
        <LabeledStat
          variant={variant}
          boosted={isBoosted ? formatted.boostedTotalApy : ''}
          value={formatted.totalApy}
        />
      }
      tooltip={{
        content: (
          <YearlyBreakdownTooltip
            isGovVault={isGovVault(vault)}
            boosted={isBoosted}
            rates={formatted}
          />
        ),
      }}
      loading={isLoading}
      variant={variant}
    />
  );
}
export const YearlyApyStats = memo(_YearlyApyStats);

function _DailyApyStats({
  vaultId,
  variant,
}: {
  vaultId: VaultEntity['id'];
  variant: 'small' | 'large';
}) {
  const { t } = useTranslation();

  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));

  const isLoading = useSelector(
    (state: BeefyState) =>
      // sometimes, the api skips some vaults, for now, we consider the vault loading
      !selectVaultApyAvailable(state, vaultId) || selectDidAPIReturnValuesForVault(state, vaultId)
  );
  const values = useSelector((state: BeefyState) => selectVaultTotalApy(state, vaultId));

  const formatted = formattedTotalApy(values);

  return (
    <ValueBlock
      label={t('Vault-Daily')}
      textContent={false}
      value={
        <LabeledStat
          variant={variant}
          boosted={isBoosted ? formatted.boostedTotalDaily : ''}
          value={formatted.totalDaily}
        />
      }
      tooltip={{
        content: (
          <DailyBreakdownTooltip
            isGovVault={isGovVault(vault)}
            boosted={isBoosted}
            rates={formatted}
          />
        ),
      }}
      loading={isLoading}
      variant={variant}
    />
  );
}
export const DailyApyStats = memo(_DailyApyStats);
