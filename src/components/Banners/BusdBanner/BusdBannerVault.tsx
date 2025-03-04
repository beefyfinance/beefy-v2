import { memo } from 'react';
import { useAppSelector } from '../../../store.ts';
import { selectVaultById } from '../../../features/data/selectors/vaults.ts';
import type { VaultEntity } from '../../../features/data/entities/vault.ts';
import { BusdBanner } from './BusdBanner.tsx';

export type BusdBannerVaultProps = {
  vaultId: VaultEntity['id'];
};

export const BusdBannerVault = memo<BusdBannerVaultProps>(function BusdBannerVault({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  return vault.assetIds.includes('BUSD') ? <BusdBanner /> : null;
});
