import { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { type VaultEntity } from '../../../../../../../../data/entities/vault';
import { VaultAtDepositStat } from '../../../../../../../../../components/VaultStats/VaultAtDepositStat';
import { RowMobile } from '../../../../Row';
import { VaultApyStat } from '../../../../../../../../../components/VaultStats/VaultApyStat';
import { VaultDailyUsdStat } from '../../../../../../../../../components/VaultStats/VaultDailyUsdStat';
import { useAppSelector } from '../../../../../../../../../store';
import { MobileVaultRewardsStat } from '../../../../../../../../../components/VaultStats/MobileVaultRewardsStat';
import { selectVaultPnl } from '../../../../../../../../data/selectors/analytics';
import { MobileVaultYieldStat } from '../../../../../../../../../components/VaultStats/MobileVaultYieldStat';
import { VaultDepositStat } from '../../../../../../../../../components/VaultStats/VaultDepositStat';

const useStyles = makeStyles(styles);

interface VaultDashboardMobileStatsProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const VaultDashboardMobileStats = memo<VaultDashboardMobileStatsProps>(
  function VaultDashboardMobileStats({ vaultId, address }) {
    const classes = useStyles();
    const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId, address));

    return (
      <RowMobile>
        <div className={classes.inner}>
          <VaultAtDepositStat
            pnlData={pnlData}
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
            walletAddress={address}
          />
          <VaultDepositStat
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
            walletAddress={address}
            label={'VaultStat-Now'}
          />
          <MobileVaultYieldStat
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
            walletAddress={address}
          />
          <MobileVaultRewardsStat
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
            walletAddress={address}
          />
          <VaultApyStat
            type={'yearly'}
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
          />
          <VaultDailyUsdStat
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
      </RowMobile>
    );
  }
);
