import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { isGovVault, isGovVaultCowcentrated, type VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { ApyStats } from '../../../../components/ApyStats';
import { VaultTvl } from '../../../../components/VaultTvl/VaultTvl';
import { VaultDeposited } from '../../../../components/VaultDeposited/VaultDeposited';
import { GovVaultRewards } from '../../../../components/GovVaultRewards/GovVaultRewards';
import { useAppSelector } from '../../../../store';
import clsx from 'clsx';
import { LastHarvest } from '../../../../components/LastHarvest/LastHarvest';

const useStyles = makeStyles(styles);

function VaultsStatsComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={classes.boxes}>
      <div className={clsx(classes.stats, classes.statsInterest)}>
        <div className={classes.stat}>
          <VaultTvl vaultId={vaultId} />
        </div>
        <div className={classes.stat}>
          <ApyStats type="yearly" vaultId={vaultId} />
        </div>
        <div className={classes.stat}>
          <ApyStats type="daily" vaultId={vaultId} />
        </div>
      </div>
      <div className={clsx(classes.stats, classes.statsDeposit)}>
        <div className={classes.stat}>
          <VaultDeposited vaultId={vaultId} />
        </div>
        {isGovVault(vault) && !isGovVaultCowcentrated(vault) ? (
          <div className={classes.stat}>
            <GovVaultRewards vaultId={vaultId} />
          </div>
        ) : (
          <div className={classes.stat}>
            <LastHarvest vaultId={vaultId} />
          </div>
        )}
      </div>
    </div>
  );
}

export const VaultsStats = memo(VaultsStatsComponent);
