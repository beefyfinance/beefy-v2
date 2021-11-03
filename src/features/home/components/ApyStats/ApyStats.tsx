import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { styles } from './styles';
import { LabeledStat } from '../LabeledStat';
import { Typography, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatApy } from '../../../../helpers/format';
import BigNumber from 'bignumber.js';
import { Popover } from '../../../../components/Popover';
import { ApyStatsProps } from './ApyStatsProps';
import { DailyBreakdownTooltipProps } from './DailyBreakdownTooltipProps';
import { YearlyBreakdownTooltipProps } from './YearlyBreakdownTooltipProps';

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

const _YearlyBreakdownTooltip: React.FC<YearlyBreakdownTooltipProps> = ({ rates, isGovVault }) => {
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
    value: rates.totalApy,
    last: true,
  });

  return <BreakdownTooltip rows={rows} />;
}

const YearlyBreakdownTooltip = memo(_YearlyBreakdownTooltip);

const _DailyBreakdownTooltip: React.FC<DailyBreakdownTooltipProps> = ({ rates, isGovVault }) => {
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
    value: rates.totalDaily,
    last: true,
  });

  return <BreakdownTooltip rows={rows} />;
}

const DailyBreakdownTooltip = memo(_DailyBreakdownTooltip);

const LabeledStatWithTooltip = memo(
  ({ children, boosted, label, value, spacer, ...passthrough }: any) => {
    const classes = useStyles();

    return (
      <div className={classes.centerSpace}>
        <div className={classes.stat}>
          <div className={classes.tooltipLabel}>
            <Typography className={classes.label}>{label}</Typography>
            <div className={classes.tooltipHolder}>
              <Popover {...({} as any)}>{children}</Popover>
            </div>
          </div>
          <LabeledStat {...({boosted} as any)} value={value} />
          {spacer ? <div className={classes.boostSpacer} /> : null}
        </div>
      </div>
    );
  }
);

export const _ApyStats: React.FC<ApyStatsProps> = ({
  apy,
  launchpoolApr,
  isLoading = false,
  itemClasses,
  itemInnerClasses,
  spacer,
  isGovVault,
}) => {
  const { t } = useTranslation();
  const isBoosted = !!launchpoolApr;
  const values: Record<string, any> = {};

  values.totalApy = apy.totalApy;
  if (isGovVault) {
    console.log('ASDASDASD');
    console.log(apy);
  }

  if (apy.vaultApr) {
    values.vaultApr = apy.vaultApr;
    values.vaultDaily = apy.vaultApr / 365;
  }

  if (apy.tradingApr) {
    values.tradingApr = apy.tradingApr;
    values.tradingDaily = apy.tradingApr / 365;
  }

  if (values.vaultDaily || values.tradingDaily) {
    values.totalDaily = (values.vaultDaily || 0) + (values.tradingDaily || 0);
  } else {
    values.totalDaily = yearlyToDaily(values.totalApy);
  }
  
  if (isGovVault) {
    values.totalApy = apy.vaultApr / 1;
    values.totalDaily = apy.vaultApr / 365;
  }

  if (isBoosted) {
    values.boostApr = launchpoolApr;
    values.boostDaily = launchpoolApr / 365;
    values.boostedTotalApy = values.boostApr ? values.totalApy + values.boostApr : 0;
    values.boostedTotalDaily = values.boostDaily ? values.totalDaily + values.boostDaily : 0;
  }

  if (isGovVault) {
    console.log(values);
  }

  const formatted = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatApy(value /*, 4*/) // TODO: fix this formatApy
        : formatApy(value);
      return [key, formattedValue];
    })
  );

  if (isGovVault) {
    console.log(formatted);
  }

  return (
    <>
      <LabeledStatWithTooltip
        value={formatted.totalApy}
        label={isGovVault ? t('APR') : t('APY')}
        boosted={isBoosted ? formatted.boostedTotalApy : ''}
        isLoading={isLoading}
        className={`tooltip-toggle ${itemInnerClasses}`}
        spacer={spacer}
      >
        <YearlyBreakdownTooltip rates={formatted} isGovVault={isGovVault} />
      </LabeledStatWithTooltip>

      <LabeledStatWithTooltip
        value={formatted.totalDaily}
        label={t('Vault-Daily')}
        boosted={isBoosted ? formatted.boostedTotalDaily : ''}
        isLoading={isLoading}
        className={`tooltip-toggle ${itemInnerClasses}`}
        spacer={spacer}
      >
        <DailyBreakdownTooltip rates={formatted} isGovVault={isGovVault} />
      </LabeledStatWithTooltip>
    </>
  );
};

export const ApyStats = memo(_ApyStats);
