import { makeStyles } from '@material-ui/core';
import { memo, useMemo } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { useAppSelector } from '../../../../../../store';
import { selectYieldStatsByVaultId, selectVaultTotalApy } from '../../../../../data/selectors/apy';
import { formatLargeUsd, formatTotalApy } from '../../../../../../helpers/format';
import { useTranslation } from 'react-i18next';
import { selectIsVaultBoosted } from '../../../../../data/selectors/boosts';
import { styles } from './styles';
import { MobileStat } from '../MobileStat';

const useStyles = makeStyles(styles);

interface TableStatsInterface {
  vaultId: VaultEntity['id'];
  address: string;
}

export const TabletStats = memo<TableStatsInterface>(function TabletStats({ vaultId, address }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const { dailyUsd } = useAppSelector(state => selectYieldStatsByVaultId(state, vaultId, address));

  const values = useAppSelector(state => selectVaultTotalApy(state, vaultId));
  const formatted = useMemo(() => formatTotalApy(values, '???'), [values]);
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));

  return (
    <div className={classes.container}>
      <MobileStat
        label={t('APY')}
        value={isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
        valueClassName={isBoosted ? classes.boostText : ''}
      />
      <MobileStat label={t('Dashboard-Filter-DailyYield')} value={formatLargeUsd(dailyUsd)} />
    </div>
  );
});
