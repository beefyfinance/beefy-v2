import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import React, { memo } from 'react';
import { VaultEntity, isGovVault } from '../../features/data/entities/vault';
import clsx from 'clsx';
import { VaultDailyUsdStat } from './VaultDailyUsdStat';
import { VaultPnlStat } from './VaultPnlStat';
import { VaultAtDepositStat } from './VaultAtDepositStat';
import { VaultNowStat } from './VaultNowStat';
import { VaultYearlyStat } from './VaultYearlyStat';
import { useAppSelector } from '../../store';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultRewardsStat } from './VaultRewardsStat';
import { VaultYieledWithRewardsStat } from './VaultYieledWithRewardsStat';

const useStyles = makeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultDashboardStats = memo<VaultStatsProps>(function VaultStats({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={classes.vaultStats}>
      <div className={clsx(classes.rowDashboard)}>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultAtDepositStat
            triggerClassName={clsx(classes.textOverflow, classes.maxWidth80)}
            showLabel={false}
            vaultId={vaultId}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultNowStat
            triggerClassName={clsx(classes.textOverflow, classes.maxWidth80)}
            showLabel={false}
            vaultId={vaultId}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          {isGovVault(vault) ? (
            <VaultRewardsStat showLabel={false} vaultId={vaultId} />
          ) : (
            <VaultYieledWithRewardsStat vaultId={vaultId} />
          )}
        </div>
        <div className={classes.column}>
          <VaultPnlStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultYearlyStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultDailyUsdStat className={classes.textOverflow} showLabel={false} vaultId={vaultId} />
        </div>
      </div>
    </div>
  );
});
