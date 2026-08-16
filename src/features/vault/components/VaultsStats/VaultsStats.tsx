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
import { selectClmFamilyForVaultPage, selectVaultById } from '../../../data/selectors/vaults.ts';
import {
  type ClmFamilySides,
  FamilyApyStats,
  FamilyVaultDeposited,
  FamilyVaultTvl,
} from './ClmFamilyStats.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

function VaultsStatsComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const clmFamily = useAppSelector(state => selectClmFamilyForVaultPage(state, vaultId));
  const family: ClmFamilySides | undefined =
    clmFamily && clmFamily.poolSideId && clmFamily.vaultSideId ?
      {
        poolId: clmFamily.poolSideId,
        vaultId: clmFamily.vaultSideId,
        activeSide: clmFamily.activeSide,
      }
    : undefined;

  return (
    <div className={classes.boxes}>
      <div className={css(styles.stats, styles.statsInterest)}>
        <div className={classes.stat}>
          {family ?
            <FamilyVaultTvl family={family} />
          : <VaultTvl vaultId={vaultId} />}
        </div>
        <div className={classes.stat}>
          {family ?
            <FamilyApyStats type="yearly" family={family} />
          : <ApyStats type="yearly" vaultId={vaultId} />}
        </div>
        <div className={classes.stat}>
          {family ?
            <FamilyApyStats type="daily" family={family} />
          : <ApyStats type="daily" vaultId={vaultId} />}
        </div>
      </div>
      <div className={css(styles.stats, styles.statsDeposit)}>
        <div className={classes.stat}>
          {family ?
            <FamilyVaultDeposited family={family} />
          : <VaultDeposited vaultId={vaultId} />}
        </div>
        {isGovVault(vault) && !isGovVaultCowcentrated(vault) ?
          <div className={classes.stat}>
            <GovVaultRewards vaultId={vaultId} />
          </div>
        : <div className={classes.stat}>
            <LastHarvest vaultId={vaultId} />
          </div>
        }
      </div>
    </div>
  );
}

export const VaultsStats = memo(VaultsStatsComponent);
