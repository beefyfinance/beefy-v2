import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import React, { memo } from 'react';
import { VaultEntity } from '../../features/data/entities/vault';
import clsx from 'clsx';
import { VaultDailyUsdStat } from './VaultDailyUsdStat';
import { VaultPnlStat } from './VaultPnlStat';
import { VaultYieledStat } from './VaultYieledStat';
import { VaultAtDepositStat } from './VaultAtDepositStat';
import { VaultNowStat } from './VaultNowStat';
import { VaultYearlyStat } from './VaultYearlyStat';

const useStyles = makeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultDashboardStats = memo<VaultStatsProps>(function VaultStats({ vaultId }) {
  const classes = useStyles();

  return (
    <div className={classes.vaultStats}>
      <div className={clsx(classes.rowDashboard)}>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultAtDepositStat
            className={classes.textOverflow}
            showLabel={false}
            vaultId={vaultId}
            triggerClassName={classes.triggerContainer}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultNowStat
            className={classes.textOverflow}
            showLabel={false}
            vaultId={vaultId}
            triggerClassName={classes.triggerContainer}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultYieledStat
            className={clsx(classes.textOverflow, classes.green, classes.columnFlex)}
            showLabel={false}
            vaultId={vaultId}
          />
        </div>
        <div className={classes.column}>
          <VaultPnlStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultYearlyStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultDailyUsdStat
            className={classes.textOverflow}
            triggerClassName={classes.triggerContainer}
            showLabel={false}
            vaultId={vaultId}
          />
        </div>
      </div>
    </div>
  );
});
