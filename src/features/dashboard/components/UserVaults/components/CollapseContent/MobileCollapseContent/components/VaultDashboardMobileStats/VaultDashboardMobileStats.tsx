import { memo } from 'react';
import { styles } from './styles.ts';
import { legacyMakeStyles } from '../../../../../../../../../helpers/mui.ts';
import { type VaultEntity } from '../../../../../../../../data/entities/vault.ts';
import { VaultAtDepositStat } from '../../../../../../../../../components/VaultStats/VaultAtDepositStat.tsx';
import { RowMobile } from '../../../../Row/Row.tsx';
import { VaultApyStat } from '../../../../../../../../../components/VaultStats/VaultApyStat.tsx';
import { VaultDailyUsdStat } from '../../../../../../../../../components/VaultStats/VaultDailyUsdStat.tsx';
import { useAppSelector } from '../../../../../../../../../store.ts';
import { MobileVaultRewardsStat } from '../../../../../../../../../components/VaultStats/MobileVaultRewardsStat.tsx';
import { selectVaultPnl } from '../../../../../../../../data/selectors/analytics.ts';
import { MobileVaultYieldStat } from '../../../../../../../../../components/VaultStats/MobileVaultYieldStat.tsx';
import { VaultDepositStat } from '../../../../../../../../../components/VaultStats/VaultDepositStat.tsx';

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

  return (
    <RowMobile>
      <div className={classes.inner}>
        <VaultAtDepositStat
          pnlData={pnlData}
          css={styles.statMobile}
          contentCss={styles.valueContainer}
          triggerCss={styles.value}
          labelCss={styles.label}
          vaultId={vaultId}
          walletAddress={address}
        />
        <VaultDepositStat
          css={styles.statMobile}
          contentCss={styles.valueContainer}
          triggerCss={styles.value}
          labelCss={styles.label}
          vaultId={vaultId}
          walletAddress={address}
          label={'VaultStat-Now'}
        />
        <MobileVaultYieldStat
          css={styles.statMobile}
          contentCss={styles.valueContainer}
          triggerCss={styles.value}
          labelCss={styles.label}
          vaultId={vaultId}
          walletAddress={address}
        />
        <MobileVaultRewardsStat
          css={styles.statMobile}
          contentCss={styles.valueContainer}
          triggerCss={styles.value}
          labelCss={styles.label}
          vaultId={vaultId}
          walletAddress={address}
        />
        <VaultApyStat
          type={'yearly'}
          css={styles.statMobile}
          contentCss={styles.valueContainer}
          triggerCss={styles.value}
          labelCss={styles.label}
          vaultId={vaultId}
        />
        <VaultDailyUsdStat
          css={styles.statMobile}
          contentCss={styles.valueContainer}
          triggerCss={styles.value}
          labelCss={styles.label}
          vaultId={vaultId}
          walletAddress={address}
        />
      </div>
    </RowMobile>
  );
});
