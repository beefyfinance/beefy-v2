import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { css } from '@repo/styles/css';
import { VaultDailyUsdStat } from './VaultDailyUsdStat.tsx';
import { VaultPnlStat } from './VaultPnlStat.tsx';
import { VaultAtDepositStat } from './VaultAtDepositStat.tsx';
import { VaultApyStat } from './VaultApyStat.tsx';
import { useAppSelector } from '../../store.ts';
import { selectVaultPnl } from '../../features/data/selectors/analytics.ts';
import { VaultYieldRewardsStat } from './VaultYieldRewardsStat.tsx';
import { VaultDepositStat } from './VaultDepositStat.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
  address: string;
};
export const VaultDashboardStats = memo(function VaultStats({ vaultId, address }: VaultStatsProps) {
  const classes = useStyles();
  const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId, address));

  return (
    <div className={classes.vaultStats}>
      <div className={css(styles.rowDashboard)}>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultAtDepositStat
            pnlData={pnlData}
            triggerCss={styles.textOverflow}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultDepositStat
            triggerCss={styles.textOverflow}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultYieldRewardsStat showLabel={false} vaultId={vaultId} walletAddress={address} />
        </div>
        <div className={css(styles.column, styles.columnDashboard)}>
          <VaultPnlStat
            walletAddress={address}
            pnlData={pnlData}
            showLabel={false}
            vaultId={vaultId}
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideMd)}>
          <VaultApyStat type="yearly" showLabel={false} vaultId={vaultId} />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideMd)}>
          <VaultDailyUsdStat
            triggerCss={styles.textOverflow}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
      </div>
    </div>
  );
});
