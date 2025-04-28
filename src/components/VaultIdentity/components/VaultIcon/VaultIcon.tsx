import { memo } from 'react';
import type { VaultEntity } from '../../../../features/data/entities/vault.ts';
import { VaultIdImage } from '../../../TokenImage/TokenImage.tsx';

export type VaultIconProps = {
  vaultId: VaultEntity['id'];
  size?: number;
};
export const VaultIcon = memo(function VaultIcon({ vaultId, size = 48 }: VaultIconProps) {
  return <VaultIdImage vaultId={vaultId} size={size} />;
});
