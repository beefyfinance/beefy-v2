import { lazy, memo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectBannerStructuresForVault } from '../../../data/selectors/points.ts';
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
  const structures = useAppSelector(state => selectBannerStructuresForVault(state, vaultId));
  if (structures.length === 0) return null;

  return (
    <>
      {structures.map(structure => (
        <PointsBanner key={structure.id} structure={structure} />
      ))}
    </>
  );
});
