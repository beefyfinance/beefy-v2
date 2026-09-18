import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatLargePercent,
  formatLargeUsd,
  formatTotalApy,
} from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  selectApyVaultUIData,
  selectDashboardClmBlendedApy,
  selectDashboardRateVaultId,
  selectDashboardRateVaultIds,
  selectDashboardRowDailyUsd,
} from '../../../../../data/selectors/apy.ts';
import { MobileStat } from '../MobileStat/MobileStat.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface TableStatsInterface {
  vaultId: VaultEntity['id'];
  address: string;
}

export const TabletStats = memo(function TabletStats({ vaultId, address }: TableStatsInterface) {
  const classes = useStyles();
  const { t } = useTranslation();
  // the same rate as the desktop cell: a CLM row's held side, or the blend when both sides earn
  const apy = useAppSelector(state =>
    selectApyVaultUIData(state, selectDashboardRateVaultId(state, vaultId, address))
  );
  const isBlend = useAppSelector(
    state => selectDashboardRateVaultIds(state, vaultId, address).length > 1
  );
  const blended = useAppSelector(state => selectDashboardClmBlendedApy(state, vaultId, address));
  const dailyUsd = useAppSelector(state => selectDashboardRowDailyUsd(state, vaultId, address));
  const formatted = useMemo(
    () => (apy.status === 'available' ? formatTotalApy(apy.values, '???') : undefined),
    [apy]
  );
  const label = useMemo(
    () => t(apy.type === 'apr' ? 'VaultStat-APR' : 'VaultStat-APY'),
    [t, apy.type]
  );

  if (apy.status !== 'available' || !formatted) {
    return (
      <div className={classes.container}>
        <MobileStat label={label} value={apy.status === 'missing' ? '?' : '-'} />
        <MobileStat
          label={t('Dashboard-Filter-DailyYield')}
          value={apy.status === 'missing' ? '?' : '-'}
        />
      </div>
    );
  }

  const isBoosted = !!apy.boosted;
  return (
    <div className={classes.container}>
      {isBlend ?
        <MobileStat
          label={t('VaultStat-APY')}
          value={blended === undefined ? '???' : formatLargePercent(blended, 2)}
        />
      : <MobileStat
          label={label}
          value={isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
          valueCss={isBoosted ? styles.boostText : undefined}
        />
      }
      <MobileStat label={t('Dashboard-Filter-DailyYield')} value={formatLargeUsd(dailyUsd)} />
    </div>
  );
});
