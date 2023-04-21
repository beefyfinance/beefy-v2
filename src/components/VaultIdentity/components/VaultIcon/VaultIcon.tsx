import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { VaultEntity } from '../../../../features/data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../../features/data/selectors/vaults';
import { AssetsImage } from '../../../AssetsImage';

const useStyles = makeStyles(styles);

export type VaultIconProps = {
  vaultId: VaultEntity['id'];
};
export const VaultIcon = memo<VaultIconProps>(function VaultIcon({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <AssetsImage className={classes.vaultIcon} assetIds={vault.assetIds} chainId={vault.chainId} />
  );
});
