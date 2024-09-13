import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { type VaultEntity } from '../../features/data/entities/vault';
import clsx from 'clsx';
import { VaultDailyUsdStat } from './VaultDailyUsdStat';
import { VaultPnlStat } from './VaultPnlStat';
import { VaultAtDepositStat } from './VaultAtDepositStat';
import { VaultApyStat } from './VaultApyStat';
import { useAppSelector } from '../../store';
import { selectVaultPnl } from '../../features/data/selectors/analytics';
import { VaultYieldRewardsStat } from './VaultYieldRewardsStat';
import { VaultDepositStat } from './VaultDepositStat';

const useStyles = makeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
  address: string;
};
export const VaultDashboardStats = memo<VaultStatsProps>(function VaultStats({ vaultId, address }) {
  const classes = useStyles();
  const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId, address));

  return (
    <div className={classes.vaultStats}>
      <div className={clsx(classes.rowDashboard)}>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultAtDepositStat
            pnlData={pnlData}
            triggerClassName={clsx(classes.textOverflow)}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultDepositStat
            triggerClassName={clsx(classes.textOverflow)}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
        <div className={clsx(classes.column, classes.hideSm)}>
          <VaultYieldRewardsStat showLabel={false} vaultId={vaultId} walletAddress={address} />
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
          <VaultApyStat type="yearly" showLabel={false} vaultId={vaultId} />
        </div>
        <div className={clsx(classes.column, classes.hideMd)}>
          <VaultDailyUsdStat
            triggerClassName={clsx(classes.textOverflow)}
            showLabel={false}
            vaultId={vaultId}
            walletAddress={address}
          />
        </div>
      </div>
    </div>
  );
});
