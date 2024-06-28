import React, { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { VaultEntity } from '../../../../../../../../data/entities/vault';
import { VaultAtDepositStat } from '../../../../../../../../../components/VaultStats/VaultAtDepositStat';
import { VaultNowStat } from '../../../../../../../../../components/VaultStats/VaultNowStat';
import { RowMobile } from '../../../../Row';
import { VaultYearlyStat } from '../../../../../../../../../components/VaultStats/VaultYearlyStat';
import { VaultDailyUsdStat } from '../../../../../../../../../components/VaultStats/VaultDailyUsdStat';
import { useAppSelector } from '../../../../../../../../../store';
import { MobileVaultRewardsStat } from '../../../../../../../../../components/VaultStats/MobileVaultRewardsStat';
import { selectVaultPnl } from '../../../../../../../../data/selectors/analytics';
import { MobileVaultYieldStat } from '../../../../../../../../../components/VaultStats/MobileVaultYieldStat';
import { selectVaultUnderlyingCowcentratedVaultIdOrUndefined } from '../../../../../../../../data/selectors/vaults';

const useStyles = makeStyles(styles);

interface VaultDashboardMobileStatsProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const VaultDashboardMobileStats = memo<VaultDashboardMobileStatsProps>(
  function VaultDashboardMobileStats({ vaultId, address }) {
    const classes = useStyles();
    const underlyingCLMId = useAppSelector(state =>
      selectVaultUnderlyingCowcentratedVaultIdOrUndefined(state, vaultId)
    );
    const pnlData = useAppSelector(state =>
      selectVaultPnl(state, underlyingCLMId ?? vaultId, address)
    );

    return (
      <RowMobile>
        <div className={classes.inner}>
          <VaultAtDepositStat
            pnlData={pnlData}
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={underlyingCLMId ?? vaultId}
            walletAddress={address}
          />
          <VaultNowStat
            pnlData={pnlData}
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={underlyingCLMId ?? vaultId}
            walletAddress={address}
          />
          <MobileVaultRewardsStat
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={underlyingCLMId ?? vaultId}
            walletAddress={address}
          />
          <MobileVaultYieldStat
            pnlData={pnlData}
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={underlyingCLMId ?? vaultId}
            walletAddress={address}
          />
          <VaultYearlyStat
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
