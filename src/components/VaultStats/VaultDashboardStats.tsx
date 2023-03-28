import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import React, { memo } from 'react';
import { VaultEntity } from '../../features/data/entities/vault';
import clsx from 'clsx';
import { VaultDailyStat } from './VaultDailyStat';
import { VaultDailyUsdStat } from './VaultDailyUsdStat';
import { VaultPnlStat } from './VaultPnlStat';
import { VaultYieledStat } from './VaultYieledStat';
import { VaultAtDepositStat } from './VaultAtDepositStat';
import { VaultNowStat } from './VaultNowStat';

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
          <VaultAtDepositStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultNowStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultYieledStat showLabel={false} vaultId={vaultId} className={classes.green} />
        </div>
        <div className={classes.column}>
          <VaultPnlStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultDailyStat showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultDailyUsdStat showLabel={false} vaultId={vaultId} />
        </div>
      </div>
    </div>
  );
});
