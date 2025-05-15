import { memo } from 'react';
import type { VaultEntity } from '../../../features/data/entities/vault.ts';
import { selectVaultById } from '../../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
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
