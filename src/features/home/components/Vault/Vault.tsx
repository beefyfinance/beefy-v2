import { memo } from 'react';
import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isGovVault,
  isVaultRetired,
  type VaultEntity,
} from '../../../data/entities/vault';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { selectVaultById } from '../../../data/selectors/vaults';
import clsx from 'clsx';
import { useAppSelector } from '../../../../store';
import { Link } from 'react-router-dom';
import { VaultIdentity } from '../../../../components/VaultIdentity';
import { VaultStats } from '../../../../components/VaultStats';

const useStyles = makeStyles(styles);

export type VaultProps = {
  vaultId: VaultEntity['id'];
};
export const Vault = memo<VaultProps>(function Vault({ vaultId }) {
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
      className={clsx({
        [classes.vault]: true,
        [classes.vaultCowcentrated]: isCowcentrated,
        [classes.vaultCowcentratedPool]: isCowcentratedPool,
        [classes.vaultCowcentratedVault]: isCowcentratedStandard,
        [classes.vaultRetired]: isRetired,
        [classes.vaultEarnings]: isGov,
      })}
    >
      <div className={classes.vaultInner}>
        <VaultIdentity vaultId={vaultId} />
        <VaultStats vaultId={vaultId} />
      </div>
    </Link>
  );
});
