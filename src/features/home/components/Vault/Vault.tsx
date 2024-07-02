import React, { memo } from 'react';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
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
  const isCowcentratedPool = isCowcentratedGovVault(vault);
  const isCowcentrated = !isCowcentratedPool && isCowcentratedLikeVault(vault); // cowcentrated or cowcentrated standard
  const isGov = !isCowcentrated && !isCowcentratedPool && isGovVault(vault); // gov but not cowcentrated pool

  return (
    <Link
      to={`/vault/${vaultId}`}
      className={clsx({
        [classes.vault]: true,
        [classes.vaultCowcentrated]: isCowcentrated,
        [classes.vaultCowcentratedPool]: isCowcentratedPool,
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
