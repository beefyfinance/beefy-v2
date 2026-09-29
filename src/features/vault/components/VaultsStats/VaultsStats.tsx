import { css } from '@repo/styles/css';
import { memo } from 'react';
import { ApyStats } from '../../../../components/ApyStats/ApyStats.tsx';
import { GovVaultRewards } from '../../../../components/GovVaultRewards/GovVaultRewards.tsx';
import { LastHarvest } from '../../../../components/LastHarvest/LastHarvest.tsx';
import { VaultDeposited } from '../../../../components/VaultDeposited/VaultDeposited.tsx';
import { VaultTvl } from '../../../../components/VaultTvl/VaultTvl.tsx';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import {
  isGovVault,
  isGovVaultCowcentrated,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

function VaultsStatsComponent({
  vaultId,
  modeVaultId = vaultId,
}: {
  vaultId: VaultEntity['id'];
  /** on a merged CLM page: the selected wrapper, driving the rate/harvest stats */
  modeVaultId?: VaultEntity['id'];
}) {
  const classes = useStyles();
  const modeVault = useAppSelector(state => selectVaultById(state, modeVaultId));

  return (
    <div className={classes.boxes}>
      <div className={css(styles.stats, styles.statsInterest)}>
        <div className={classes.stat}>
          <VaultTvl vaultId={vaultId} />
        </div>
        <div className={classes.stat}>
          <ApyStats type="yearly" vaultId={modeVaultId} />
        </div>
        <div className={classes.stat}>
          <ApyStats type="daily" vaultId={modeVaultId} />
        </div>
      </div>
      <div className={css(styles.stats, styles.statsDeposit)}>
        <div className={classes.stat}>
          <VaultDeposited vaultId={vaultId} />
        </div>
        {isGovVault(modeVault) && !isGovVaultCowcentrated(modeVault) ?
          <div className={classes.stat}>
            <GovVaultRewards vaultId={modeVaultId} />
          </div>
        : <div className={classes.stat}>
            <LastHarvest vaultId={modeVaultId} />
          </div>
        }
      </div>
    </div>
  );
}

export const VaultsStats = memo(VaultsStatsComponent);
