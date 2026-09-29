import { css } from '@repo/styles/css';
import { memo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectVaultPnl } from '../../features/data/selectors/analytics.ts';
import { selectDashboardPrimaryVaultId } from '../../features/data/selectors/dashboard.ts';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { styles } from './styles.ts';
import { VaultApyStat } from './VaultApyStat.tsx';
import { VaultAtDepositStat } from './VaultAtDepositStat.tsx';
import { VaultDailyUsdStat } from './VaultDailyUsdStat.tsx';
import { VaultPnlStat } from './VaultPnlStat.tsx';
import { VaultYieldRewardsStat } from './VaultYieldRewardsStat.tsx';
import { VaultDepositNowStat } from './VaultDepositNowStat.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
  address: string;
};
export const VaultDashboardStats = memo(function VaultStats({ vaultId, address }: VaultStatsProps) {
  const classes = useStyles();
  const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId, address));
  // a CLM row's numbers are the group's, but its timelines live on the wrappers it holds
  const timelineVaultId = useAppSelector(state =>
    selectDashboardPrimaryVaultId(state, vaultId, address)
  );

  return (
    <div className={classes.vaultStats}>
      <div className={css(styles.rowDashboard)}>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultAtDepositStat
            pnlData={pnlData}
            textWrap={false}
            showLabel={false}
            vaultId={timelineVaultId}
            walletAddress={address}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultDepositNowStat
            pnlData={pnlData}
            textWrap={false}
            showLabel={false}
            vaultId={timelineVaultId}
            walletAddress={address}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultYieldRewardsStat
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard)}>
          <VaultPnlStat
            walletAddress={address}
            pnlData={pnlData}
            showLabel={false}
            vaultId={timelineVaultId}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideMd)}>
          <VaultApyStat
            type="yearly"
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideMd)}>
          <VaultDailyUsdStat
            textWrap={false}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
            align="right"
          />
        </div>
      </div>
    </div>
  );
});
