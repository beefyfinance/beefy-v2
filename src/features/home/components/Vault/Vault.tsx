import React, { memo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import {
  selectIsVaultCowcentratedLike,
  selectIsVaultGov,
  selectIsVaultRetired,
} from '../../../data/selectors/vaults';
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
  const isRetired = useAppSelector(state => selectIsVaultRetired(state, vaultId));
  const isGov = useAppSelector(state => selectIsVaultGov(state, vaultId));
  const isCowcentratedLike = useAppSelector(state => selectIsVaultCowcentratedLike(state, vaultId));

  return (
    <Link
      to={`/vault/${vaultId}`}
      className={clsx({
        [classes.vault]: true,
        [classes.vaultCowcentrated]: isCowcentratedLike === 'cowcentrated',
        [classes.vaultCowcentratedPool]: isCowcentratedLike === 'gov',
        [classes.vaultRetired]: isRetired,
        [classes.vaultEarnings]: isGov && !isCowcentratedLike,
      })}
    >
      <div className={classes.vaultInner}>
        <VaultIdentity vaultId={vaultId} />
        <VaultStats vaultId={vaultId} />
      </div>
    </Link>
  );
});
