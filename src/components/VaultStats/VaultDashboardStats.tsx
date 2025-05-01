import { css } from '@repo/styles/css';
import { memo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectVaultPnl } from '../../features/data/selectors/analytics.ts';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { useAppSelector } from '../../store.ts';
import { styles } from './styles.ts';
import { VaultApyStat } from './VaultApyStat.tsx';
import { VaultAtDepositStat } from './VaultAtDepositStat.tsx';
import { VaultDailyUsdStat } from './VaultDailyUsdStat.tsx';
import { VaultDepositStat } from './VaultDepositStat.tsx';
import { VaultPnlStat } from './VaultPnlStat.tsx';
import { VaultYieldRewardsStat } from './VaultYieldRewardsStat.tsx';

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
            textWrap={false}
            hideLabel={true}
            vaultId={vaultId}
            walletAddress={address}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultDepositStat
            textWrap={false}
            hideLabel={true}
            vaultId={vaultId}
            walletAddress={address}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideSm)}>
          <VaultYieldRewardsStat
            hideLabel={true}
            vaultId={vaultId}
            walletAddress={address}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard)}>
          <VaultPnlStat
            walletAddress={address}
            pnlData={pnlData}
            hideLabel={true}
            vaultId={vaultId}
            align="right"
          />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideMd)}>
          <VaultApyStat type="yearly" hideLabel={true} vaultId={vaultId} align="right" />
        </div>
        <div className={css(styles.column, styles.columnDashboard, styles.hideMd)}>
          <VaultDailyUsdStat
            textWrap={false}
            hideLabel={true}
            vaultId={vaultId}
            walletAddress={address}
            align="right"
          />
        </div>
      </div>
    </div>
  );
});
