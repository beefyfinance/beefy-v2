import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styles from './styles';
import LabeledStat from '../LabeledStat/LabeledStat';
import { Typography, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatApy } from 'helpers/format';
import BigNumber from 'bignumber.js';
import Popover from 'components/Popover';

const useStyles = makeStyles(styles);

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

const BreakdownTooltip = memo(({ rows }) => {
  const classes = useStyles();

  return (
    <>
      {rows.map(row => (
        <Box className={classes.rows} key={row.label}>
          <div className={row.last ? classes.bold : classes.label}>{row.label}</div>
          <div className={row.last ? classes.bold : classes.value}>{row.value}</div>
        </Box>
      ))}
    </>
  );
});

const YearlyBreakdownTooltip = memo(({ rates }) => {
  const rows = [];
  const { t } = useTranslation();

  console.log('Year', rates);

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
    value: rates.totalApy,
    last: true,
  });

  return <BreakdownTooltip rows={rows} />;
});

const DailyBreakdownTooltip = memo(({ rates }) => {
  const rows = [];
  const { t } = useTranslation();

  console.log('Daily', rates);

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
    value: rates.totalDaily,
    last: true,
  });

  return <BreakdownTooltip rows={rows} />;
});

const LabeledStatWithTooltip = memo(({ children, boosted, label, value, ...passthrough }) => {
  const classes = useStyles();

  return (
    <div className={classes.centerSpace}>
      <div className={classes.stat}>
        <div className={classes.tooltipLabel}>
          <Typography className={classes.label}>{label}</Typography>
          <div className={classes.tooltipHolder}>
            <Popover>{children}</Popover>
          </div>
        </div>
        <LabeledStat boosted={boosted} value={value} />
      </div>
    </div>
  );
});

const ApyStats = ({
  apy,
  launchpoolApr,
  isGovVault,
  isLoading = false,
  itemClasses,
  itemInnerClasses,
}) => {
  const { t } = useTranslation();
  const isBoosted = !!launchpoolApr;
  const values = {};

  values.totalApy = apy.totalApy;

  if ('vaultApr' in apy && apy.vaultApr) {
    values.vaultApr = apy.vaultApr;
    values.vaultDaily = apy.vaultApr / 365;
  }

  if ('tradingApr' in apy && apy.tradingApr) {
    values.tradingApr = apy.tradingApr;
    values.tradingDaily = apy.tradingApr / 365;
  }

  if ('vaultAprDaily' in values || 'tradingAprDaily' in values) {
    values.totalDaily = (values.vaultDaily || 0) + (values.tradingDaily || 0);
  } else {
    values.totalDaily = yearlyToDaily(values.totalApy);
  }

  if (isBoosted) {
    values.boostApr = launchpoolApr;
    values.boostDaily = launchpoolApr / 365;
    values.boostedTotalApy = values.boostApr ? values.totalApy + values.boostApr : 0;
    values.boostedTotalDaily = values.boostDaily ? values.totalDaily + values.boostDaily : 0;
  }

  const formatted = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatApy(value, 4)
        : formatApy(value);
      return [key, formattedValue];
    })
  );

  return (
    <>
      <LabeledStatWithTooltip
        value={formatted.totalApy}
        label={isGovVault ? t('APR') : t('APY')}
        boosted={isBoosted ? formatted.boostedTotalApy : ''}
        isLoading={isLoading}
        className={`tooltip-toggle ${itemInnerClasses}`}
      >
        <YearlyBreakdownTooltip rates={formatted} />
      </LabeledStatWithTooltip>

      <LabeledStatWithTooltip
        value={formatted.totalDaily}
        label={t('Vault-Daily')}
        boosted={isBoosted ? formatted.boostedTotalDaily : ''}
        isLoading={isLoading}
        className={`tooltip-toggle ${itemInnerClasses}`}
      >
        <DailyBreakdownTooltip rates={formatted} />
      </LabeledStatWithTooltip>
    </>
  );
};

export default memo(ApyStats);
