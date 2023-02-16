import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import React, { memo } from 'react';
import { VaultEntity } from '../../features/data/entities/vault';
import clsx from 'clsx';
import { VaultDepositStat } from './VaultDepositStat';
import { VaultWalletStat } from './VaultWalletStat';
import { VaultYearlyStat } from './VaultYearlyStat';
import { VaultDailyStat } from './VaultDailyStat';
import { VaultTvlStat } from './VaultTvlStat';
import { VaultSafetyStat } from './VaultSafetyStat';
import { featureFlag_capture } from '../../features/data/utils/feature-flags';
import { VaultCaptureStat } from './VaultCaptureStat';

const useStyles = makeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultStats = memo<VaultStatsProps>(function VaultStats({ vaultId }) {
  const classes = useStyles();
  const capture = featureFlag_capture();

  return (
    <div className={classes.vaultStats}>
      <div className={clsx(classes.row)}>
        <div className={classes.column}>
          <VaultWalletStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultDepositStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultYearlyStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultDailyStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultTvlStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          {capture ? <VaultCaptureStat vaultId={vaultId} /> : <VaultSafetyStat vaultId={vaultId} />}
        </div>
      </div>
    </div>
  );
});
