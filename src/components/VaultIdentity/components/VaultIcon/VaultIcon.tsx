import { memo } from 'react';
import { styles } from './styles.ts';
import type { VaultEntity } from '../../../../features/data/entities/vault.ts';
import { useAppSelector } from '../../../../store.ts';
import { selectVaultById } from '../../../../features/data/selectors/vaults.ts';
import { AssetsImage } from '../../../AssetsImage/AssetsImage.tsx';
import { selectVaultTokenSymbols } from '../../../../features/data/selectors/tokens.ts';

export type VaultIconProps = {
  vaultId: VaultEntity['id'];
  size?: number;
};
export const VaultIcon = memo(function VaultIcon({ vaultId, size = 48 }: VaultIconProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const vaultTokenSymbols = useAppSelector(state => selectVaultTokenSymbols(state, vault.id));

  return (
    <AssetsImage
      size={size}
      css={styles.vaultIcon}
      assetSymbols={vaultTokenSymbols}
      chainId={vault.chainId}
    />
  );
});
