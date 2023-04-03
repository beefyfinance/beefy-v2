import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { useAppSelector } from '../../../../../../store';
import { selectVaultDailyYieldStats, selectVaultTotalApy } from '../../../../../data/selectors/apy';
import { formatBigUsd, formattedTotalApy } from '../../../../../../helpers/format';
import { useTranslation } from 'react-i18next';
import { selectIsVaultBoosted } from '../../../../../data/selectors/boosts';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

interface TableStatsInterface {
  vaultId: VaultEntity['id'];
}

export const TabletStats = memo<TableStatsInterface>(function ({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const { dailyUsd } = useAppSelector(state => selectVaultDailyYieldStats(state, vaultId));

  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));
  const formatted = useAppSelector(state => formattedTotalApy(values, '???'));
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));

  return (
    <div className={classes.container}>
      <TableStat
        label={t('APY')}
        value={isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
        className={isBoosted ? classes.boostText : ''}
      />
      <TableStat label={t('Dashboard-Filter-DailyYield')} value={formatBigUsd(dailyUsd)} />
    </div>
  );
});

interface TableStatsProps {
  label: string;
  value: string;
  className?: string;
}

const TableStat = memo<TableStatsProps>(function ({ label, value, className }) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.stat, className)}>
      {label} <span>{value}</span>
    </div>
  );
});
