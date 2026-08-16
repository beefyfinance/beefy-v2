import { css } from '@repo/styles/css';
import { memo } from 'react';
import { Link } from 'react-router';
import { VaultIdentity } from '../../../../components/VaultIdentity/VaultIdentity.tsx';
import { VaultClmFamilyStats } from '../../../../components/VaultStats/VaultClmFamilyStats.tsx';
import { VaultStats } from '../../../../components/VaultStats/VaultStats.tsx';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isGovVault,
  isVaultRetired,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { selectUserHasBalanceToMigrate } from '../../../data/selectors/balance.ts';
import {
  selectClmFamilyForRowId,
  selectVaultById,
  selectVaultByIdOrUndefined,
} from '../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';
import { selectZapCampaignByVaultId } from '../../../data/selectors/zap.ts';

const useStyles = legacyMakeStyles(styles);

export type VaultProps = {
  vaultId: VaultEntity['id'];
};
export const Vault = memo(function Vault({ vaultId }: VaultProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const family = useAppSelector(state => selectClmFamilyForRowId(state, vaultId));
  const familyVault = useAppSelector(state =>
    family ? selectVaultByIdOrUndefined(state, family.vaultId) : undefined
  );
  const isRetired =
    family && familyVault ?
      isVaultRetired(vault) && isVaultRetired(familyVault)
    : isVaultRetired(vault);
  const isCowcentratedPool = !family && isCowcentratedGovVault(vault); // cowcentrated pool
  const isCowcentratedStandard = isCowcentratedStandardVault(vault); // cowcentrated vault
  const isCowcentrated = !!family || isCowcentratedVault(vault); // naked clm or collapsed family
  const isGov = !isCowcentratedLikeVault(vault) && isGovVault(vault); // gov but not cowcentrated pool
  const isMigratable = useAppSelector(
    state =>
      selectUserHasBalanceToMigrate(state, vaultId) ||
      (!!family && selectUserHasBalanceToMigrate(state, family.vaultId))
  );
  const zapCampaign = useAppSelector(
    state =>
      selectZapCampaignByVaultId(state, vaultId) ??
      (family ? selectZapCampaignByVaultId(state, family.vaultId) : undefined)
  );

  return (
    <Link
      to={`/vault/${family?.linkId ?? vaultId}`}
      className={css(
        styles.vault,
        isCowcentrated && styles.vaultCowcentrated,
        isCowcentratedPool && styles.vaultCowcentratedPool,
        isCowcentratedStandard && styles.vaultCowcentratedVault,
        isRetired && styles.vaultRetired,
        isGov && styles.vaultEarnings,
        isMigratable && styles.vaultMigrate,
        zapCampaign && styles.vaultFreeZap
      )}
    >
      <div className={classes.vaultInner}>
        <VaultIdentity vaultId={vaultId} clmFamily={family} unifiedClmTag={true} />
        {family ?
          <VaultClmFamilyStats family={family} />
        : <VaultStats vaultId={vaultId} />}
      </div>
    </Link>
  );
});
