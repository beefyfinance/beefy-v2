import { memo } from 'react';
import { FraxtalBannerVault } from '../../../../components/Banners/FraxBanner/FraxtalBannerVault.tsx';
import { BusdBannerVault } from '../../../../components/Banners/BusdBanner/BusdBannerVault.tsx';
import { UnstakedClmBannerVault } from '../../../../components/Banners/UnstakedClmBanner/UnstakedClmBannerVault.tsx';
import { RetiredSuggestClmBanner } from '../../../../components/Banners/RetiredSuggestClmBanner/RetiredSuggestClmBanner.tsx';
import type { VaultEntity } from '../../../data/entities/vault.ts';

type VaultBannersProps = {
  vaultId: VaultEntity['id'];
};

export const VaultBanners = memo(function VaultBanners({ vaultId }: VaultBannersProps) {
  return (
    <>
      <FraxtalBannerVault vaultId={vaultId} />
      <BusdBannerVault vaultId={vaultId} />
      <UnstakedClmBannerVault vaultId={vaultId} fromVault={true} />
      <RetiredSuggestClmBanner vaultId={vaultId} />
    </>
  );
});
