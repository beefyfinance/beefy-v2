import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { VaultEntity } from '../../../../features/data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../../features/data/selectors/vaults';
import { AssetsImage } from '../../../AssetsImage';
import { selectVaultTokenSymbols } from '../../../../features/data/selectors/tokens';

const useStyles = makeStyles(styles);

export type VaultIconProps = {
  vaultId: VaultEntity['id'];
};
export const VaultIcon = memo<VaultIconProps>(function VaultIcon({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const vaultTokenSymbols = useAppSelector(state => selectVaultTokenSymbols(state, vault.id));

  return (
    <AssetsImage
      className={classes.vaultIcon}
      assetSymbols={vaultTokenSymbols}
      chainId={vault.chainId}
    />
  );
});
