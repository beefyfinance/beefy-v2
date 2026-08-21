import { lazy, memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectZapCampaignForVaultGroup } from '../../../data/selectors/zap.ts';

const FreeZapPromotionCard = lazy(() =>
  import('./FreeZapPromotionCard.tsx').then(m => ({ default: m.FreeZapPromotionCard }))
);

export type FreeZapPromotionCardLoaderProps = {
  vaultId: VaultEntity['id'];
};

export const FreeZapPromotionCardLoader = memo(function FreeZapPromotionCardLoader({
  vaultId,
}: FreeZapPromotionCardLoaderProps) {
  // group-wide: a card advertising the product must not flicker as the yield mode changes
  const zapCampaign = useAppSelector(state => selectZapCampaignForVaultGroup(state, vaultId));
  if (!zapCampaign) {
    return null;
  }

  return <FreeZapPromotionCard />;
});
