import { memo } from 'react';
import { useAppSelector } from '../../../store.ts';
import { selectVaultById } from '../../../features/data/selectors/vaults.ts';
import type { VaultEntity } from '../../../features/data/entities/vault.ts';
import { FraxBanner } from './FraxBanner.tsx';

export type FraxtalBannerVaultProps = {
  vaultId: VaultEntity['id'];
};

export const FraxtalBannerVault = memo<FraxtalBannerVaultProps>(function FraxtalBannerVault({
  vaultId,
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  return vault.chainId === 'fraxtal' ? <FraxBanner /> : null;
});
