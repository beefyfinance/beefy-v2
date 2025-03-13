import { memo } from 'react';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isGovVault,
  isVaultRetired,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { css } from '@repo/styles/css';
import { useAppSelector } from '../../../../store.ts';
import { Link } from 'react-router';
import { VaultIdentity } from '../../../../components/VaultIdentity/VaultIdentity.tsx';
import { VaultStats } from '../../../../components/VaultStats/VaultStats.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultProps = {
  vaultId: VaultEntity['id'];
};
export const Vault = memo(function Vault({ vaultId }: VaultProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isRetired = isVaultRetired(vault);
  const isCowcentratedPool = isCowcentratedGovVault(vault); // cowcentrated pool
  const isCowcentratedStandard = isCowcentratedStandardVault(vault); // cowcentrated vault
  const isCowcentrated = isCowcentratedVault(vault); // naked clm
  const isGov = !isCowcentratedLikeVault(vault) && isGovVault(vault); // gov but not cowcentrated pool

  return (
    <Link
      to={`/vault/${vaultId}`}
      className={css(
        styles.vault,
        isCowcentrated && styles.vaultCowcentrated,
        isCowcentratedPool && styles.vaultCowcentratedPool,
        isCowcentratedStandard && styles.vaultCowcentratedVault,
        isRetired && styles.vaultRetired,
        isGov && styles.vaultEarnings
      )}
    >
      <div className={classes.vaultInner}>
        <VaultIdentity vaultId={vaultId} />
        <VaultStats vaultId={vaultId} />
      </div>
    </Link>
  );
});
