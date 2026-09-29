import { memo } from 'react';
import { MobileVaultRewardsStat } from '../../../../../../../../../components/VaultStats/MobileVaultRewardsStat.tsx';
import { MobileVaultYieldStat } from '../../../../../../../../../components/VaultStats/MobileVaultYieldStat.tsx';
import { VaultApyStat } from '../../../../../../../../../components/VaultStats/VaultApyStat.tsx';
import { VaultAtDepositStat } from '../../../../../../../../../components/VaultStats/VaultAtDepositStat.tsx';
import { VaultDailyUsdStat } from '../../../../../../../../../components/VaultStats/VaultDailyUsdStat.tsx';
import { legacyMakeStyles } from '../../../../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../../../../data/store/hooks.ts';
import { type VaultEntity } from '../../../../../../../../data/entities/vault.ts';
import { selectVaultPnl } from '../../../../../../../../data/selectors/analytics.ts';
import { selectDashboardPrimaryVaultId } from '../../../../../../../../data/selectors/dashboard.ts';
import { RowMobile } from '../../../../Row/Row.tsx';
import { styles } from './styles.ts';
import { VaultDepositNowStat } from '../../../../../../../../../components/VaultStats/VaultDepositNowStat.tsx';

const useStyles = legacyMakeStyles(styles);

interface VaultDashboardMobileStatsProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const VaultDashboardMobileStats = memo(function VaultDashboardMobileStats({
  vaultId,
  address,
}: VaultDashboardMobileStatsProps) {
  const classes = useStyles();
  const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId, address));
  const timelineVaultId = useAppSelector(state =>
    selectDashboardPrimaryVaultId(state, vaultId, address)
  );

  return (
    <RowMobile>
      <div className={classes.inner}>
        <VaultAtDepositStat
          pnlData={pnlData}
          vaultId={timelineVaultId}
          walletAddress={address}
          align="right"
          layout="horizontal"
        />
        <VaultDepositNowStat
          pnlData={pnlData}
          vaultId={timelineVaultId}
          walletAddress={address}
          align="right"
          layout="horizontal"
        />
        <MobileVaultYieldStat
          vaultId={vaultId}
          walletAddress={address}
          align="right"
          layout="horizontal"
        />
        <MobileVaultRewardsStat
          vaultId={vaultId}
          walletAddress={address}
          align="right"
          layout="horizontal"
        />
        <VaultApyStat
          type={'yearly'}
          vaultId={vaultId}
          walletAddress={address}
          align="right"
          layout="horizontal"
        />
        <VaultDailyUsdStat
          vaultId={vaultId}
          walletAddress={address}
          align="right"
          layout="horizontal"
        />
      </div>
    </RowMobile>
  );
});
