import { memo } from 'react';
import type { VaultEntity } from '../../../features/data/entities/vault.ts';
import { selectVaultById } from '../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { BusdBanner } from './BusdBanner.tsx';

export type BusdBannerVaultProps = {
  vaultId: VaultEntity['id'];
};

export const BusdBannerVault = memo<BusdBannerVaultProps>(function BusdBannerVault({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  return vault.assetIds.includes('BUSD') ? <BusdBanner /> : null;
});
