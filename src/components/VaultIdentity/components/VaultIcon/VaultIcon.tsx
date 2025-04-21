import { memo } from 'react';
import type { VaultEntity } from '../../../../features/data/entities/vault.ts';
import { useAppSelector } from '../../../../store.ts';
import { selectVaultById } from '../../../../features/data/selectors/vaults.ts';
import { AssetsImage } from '../../../AssetsImage/AssetsImage.tsx';
import { selectVaultIcons } from '../../../../features/data/selectors/tokens.ts';

export type VaultIconProps = {
  vaultId: VaultEntity['id'];
  size?: number;
};

export const VaultIcon = memo(function VaultIcon({ vaultId, size = 48 }: VaultIconProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const vaultIcons = useAppSelector(state => selectVaultIcons(state, vault.id));

  return <AssetsImage size={size} assetSymbols={vaultIcons} chainId={vault.chainId} />;
});
