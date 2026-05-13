import { lazy, memo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectBannersForVault } from '../../../data/selectors/points.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';

const PointsBanner = lazy(() =>
  import('./PointsBanner.tsx').then(mod => ({ default: mod.PointsBanner }))
);

export type PointsBannerLoaderProps = {
  vaultId: VaultEntity['id'];
};

export const PointsBannerLoader = memo(function PointsBannerLoader({
  vaultId,
}: PointsBannerLoaderProps) {
  const banners = useAppSelector(state => selectBannersForVault(state, vaultId));
  if (banners.length === 0) return null;

  return (
    <>
      {banners.map(banner => (
        <PointsBanner key={banner.by} banner={banner} />
      ))}
    </>
  );
});
