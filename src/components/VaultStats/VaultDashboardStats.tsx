import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import React, { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault';
import { isGovVault } from '../../features/data/entities/vault';
import clsx from 'clsx';
import { VaultDailyUsdStat } from './VaultDailyUsdStat';
import { VaultPnlStat } from './VaultPnlStat';
import { VaultAtDepositStat } from './VaultAtDepositStat';
import { VaultNowStat } from './VaultNowStat';
import { VaultYearlyStat } from './VaultYearlyStat';
import { useAppSelector } from '../../store';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultRewardsStat } from './VaultRewardsStat';
import { VaultYieldWithRewardsStat } from './VaultYieldWithRewardsStat';
import { selectVaultPnl } from '../../features/data/selectors/analytics';

const useStyles = makeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
  address: string;
};
export const VaultDashboardStats = memo<VaultStatsProps>(function VaultStats({ vaultId, address }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId, address));

  return (
    <div className={classes.vaultStats}>
      <div className={clsx(classes.rowDashboard)}>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultAtDepositStat
            contentClassName={classes.contentContainer}
            pnlData={pnlData}
            triggerClassName={clsx(classes.textOverflow, classes.maxWidth80)}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultNowStat
            contentClassName={classes.contentContainer}
            pnlData={pnlData}
            triggerClassName={clsx(classes.textOverflow, classes.maxWidth80)}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          {isGovVault(vault) ? (
            <VaultRewardsStat walletAddress={address} showLabel={false} vaultId={vaultId} />
          ) : (
            <VaultYieldWithRewardsStat
              walletAddress={address}
              pnlData={pnlData}
              vaultId={vaultId}
            />
          )}
        </div>
        <div className={classes.column}>
          <VaultPnlStat
            walletAddress={address}
            pnlData={pnlData}
            showLabel={false}
            vaultId={vaultId}
          />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultYearlyStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultDailyUsdStat
            triggerClassName={clsx(classes.textOverflow, classes.maxWidth80)}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
      </div>
    </div>
  );
});
