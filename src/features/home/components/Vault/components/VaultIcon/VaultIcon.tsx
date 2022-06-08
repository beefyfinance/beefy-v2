import React, { memo } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { useAppSelector } from '../../../../../../store';

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
