import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { LabeledStat } from '../LabeledStat';
import { Typography, Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatApy } from '../../../../helpers/format';
import { Popover } from '../../../../components/Popover';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectVaultTotalApy } from '../../../data/selectors/apy';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { selectIsVaultBoosted } from '../../../data/selectors/boosts';
import { selectVaultApyAvailable } from '../../../data/selectors/data-loader';
import { TotalApy } from '../../../data/reducers/apy';
import { AllValuesAsString } from '../../../data/utils/types-utils';
import {
  popoverInLinkHack__popoverContainerHandler,
  popoverInLinkHack__popoverContainerStyle,
} from '../../../../helpers/list-popover-in-link-hack';

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

const LabeledStatWithTooltip = memo(({ children, boosted, label, value }: any) => {
  const classes = useStyles();

  return (
    <div
      className={classes.stat}
      onClick={popoverInLinkHack__popoverContainerHandler}
      onTouchStart={popoverInLinkHack__popoverContainerHandler}
      style={popoverInLinkHack__popoverContainerStyle}
    >
      <div className={classes.tooltipLabel}>
        <Typography className={classes.label}>{label}</Typography>
        <div className={classes.tooltipHolder}>
          <Popover {...({} as any)}>{children}</Popover>
        </div>
      </div>
      <LabeledStat {...({ boosted } as any)} value={value} />
    </div>
  );
});

export function _ApyStats({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const { t } = useTranslation();

  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));

  const isLoading = useSelector((state: BeefyState) => !selectVaultApyAvailable(state, vaultId));
  const values = useSelector((state: BeefyState) => selectVaultTotalApy(state, vaultId));

  const formatted = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatApy(value, 2)
        : formatApy(value);
      return [key, formattedValue];
    })
  );

  return (
    <>
      <Grid item xs={6} md={2} lg={2}>
        <LabeledStatWithTooltip
          value={formatted.totalApy}
          label={isGovVault(vault) ? t('APR') : t('APY')}
          boosted={isBoosted ? formatted.boostedTotalApy : ''}
          isLoading={isLoading}
          className={`tooltip-toggle`}
        >
          <YearlyBreakdownTooltip
            isGovVault={isGovVault(vault)}
            boosted={isBoosted}
            rates={formatted}
          />
        </LabeledStatWithTooltip>
      </Grid>
      <Grid item xs={6} md={2} lg={2}>
        <LabeledStatWithTooltip
          value={formatted.totalDaily}
          label={t('Vault-Daily')}
          boosted={isBoosted ? formatted.boostedTotalDaily : ''}
          isLoading={isLoading}
          className={`tooltip-toggle`}
        >
          <DailyBreakdownTooltip
            isGovVault={isGovVault(vault)}
            boosted={isBoosted}
            rates={formatted}
          />
        </LabeledStatWithTooltip>
      </Grid>
    </>
  );
}

export const ApyStats = memo(_ApyStats);
