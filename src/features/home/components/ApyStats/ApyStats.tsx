import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { LabeledStat } from '../LabeledStat';
import { Typography, Box, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import {  formatApy } from '../../../../helpers/format';
import BigNumber from 'bignumber.js';
import { Popover } from '../../../../components/Popover';
import { YearlyBreakdownTooltipProps } from './YearlyBreakdownTooltipProps';
import { DailyBreakdownTooltipProps } from './DailyBreakdownTooltipProps';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectBoostAprInfos, selectVaultApyInfos } from '../../../data/selectors/apy';
import { isGovVaultApy, isStandardVaultApy } from '../../../data/apis/beefy';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { selectActiveVaultBoostIds, selectIsVaultBoosted } from '../../../data/selectors/boosts';

const useStyles = makeStyles(styles as any);
const yearlyToDaily = apy => {
  const g = Math.pow(10, Math.log10(apy + 1) / 365) - 1;

  if (isNaN(g)) {
    return 0;
  }

  return g;
};

export function isNaN(value) {
  return new BigNumber(`${value}`).isNaN();
}

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

const _YearlyBreakdownTooltip: React.FC<YearlyBreakdownTooltipProps> = ({
  isGovVault,
  boosted,
  rates,
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

const _DailyBreakdownTooltip: React.FC<DailyBreakdownTooltipProps> = ({
  isGovVault,
  boosted,
  rates,
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

const LabeledStatWithTooltip = memo(
  ({ children, boosted, label, value, spacer, ...passthrough }: any) => {
    const classes = useStyles();

    return (
      <div className={classes.stat}>
        <div className={classes.tooltipLabel}>
          <Typography className={classes.label}>{label}</Typography>
          <div className={classes.tooltipHolder}>
            <Popover {...({} as any)}>{children}</Popover>
          </div>
        </div>
        <LabeledStat {...({ boosted } as any)} value={value} />
      </div>
    );
  }
);

export function _ApyStats({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const { t } = useTranslation();
  const values: Record<string, any> = {};

  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));
  const boostApr = useSelector((state: BeefyState) => {
    if (isBoosted) {
      const latestActiveBoost = selectActiveVaultBoostIds(state, vaultId);
      return selectBoostAprInfos(state, latestActiveBoost[0]).apr;
    } else {
      return 0;
    }
  });
  const apy = useSelector((state: BeefyState) => selectVaultApyInfos(state, vaultId));

  // TODO
  const isLoading = false;

  if (isGovVaultApy(apy)) {
    values.vaultApr = apy.vaultApr;
    values.vaultDaily = apy.vaultApr / 365;
  } else {
    values.totalApy = apy.totalApy;
  }

  if (isStandardVaultApy(apy) && apy.tradingApr !== undefined) {
    values.tradingApr = apy.tradingApr;
    values.tradingDaily = apy.tradingApr / 365;
  }

  if (values.vaultDaily || values.tradingDaily) {
    values.totalDaily = (values.vaultDaily || 0) + (values.tradingDaily || 0);
  } else {
    values.totalDaily = yearlyToDaily(values.totalApy);
  }

  if (isGovVaultApy(apy)) {
    values.totalApy = apy.vaultApr / 1;
    values.totalDaily = apy.vaultApr / 365;
  }

  if (isBoosted) {
    values.boostApr = boostApr;
    values.boostDaily = values.boostApr / 365;
    values.boostedTotalApy = values.boostApr ? values.totalApy + values.boostApr : 0;
    values.boostedTotalDaily = values.boostDaily ? values.totalDaily + values.boostDaily : 0;
  }

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
