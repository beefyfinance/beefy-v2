import React, { memo } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { useSelector } from 'react-redux';
import { BeefyState } from '../../../../../../redux-types';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { AssetsImage } from '../../../../../../components/AssetsImage';

const useStyles = makeStyles(styles);

export type VaultIconProps = {
  vaultId: VaultEntity['id'];
};
export const VaultIcon = memo<VaultIconProps>(function VaultIcon({ vaultId }) {
  const classes = useStyles();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  return (
    <AssetsImage className={classes.vaultIcon} assetIds={vault.assetIds} imageUri={vault.logoUri} />
  );
});
