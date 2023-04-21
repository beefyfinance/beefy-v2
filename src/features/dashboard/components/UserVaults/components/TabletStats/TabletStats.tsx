import { makeStyles } from '@material-ui/core';
import { memo, useMemo } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { useAppSelector } from '../../../../../../store';
import { selectVaultDailyYieldStats, selectVaultTotalApy } from '../../../../../data/selectors/apy';
import { formatBigUsd, formattedTotalApy } from '../../../../../../helpers/format';
import { useTranslation } from 'react-i18next';
import { selectIsVaultBoosted } from '../../../../../data/selectors/boosts';
import { styles } from './styles';
import { MobileStat } from '../MobileStat';

const useStyles = makeStyles(styles);

interface TableStatsInterface {
  vaultId: VaultEntity['id'];
}

export const TabletStats = memo<TableStatsInterface>(function TabletStats({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const { dailyUsd } = useAppSelector(state => selectVaultDailyYieldStats(state, vaultId));

  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));
  const formatted = useMemo(() => formattedTotalApy(values, '???'), [values]);
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));

  return (
    <div className={classes.container}>
      <MobileStat
        label={t('APY')}
        value={isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
        valueClassName={isBoosted ? classes.boostText : ''}
      />
      <MobileStat label={t('Dashboard-Filter-DailyYield')} value={formatBigUsd(dailyUsd)} />
    </div>
  );
});
