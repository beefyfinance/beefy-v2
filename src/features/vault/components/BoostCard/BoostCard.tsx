import { memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { BoostPromoEntity } from '../../../data/entities/promo.ts';
import { selectBoostActiveRewardTokens } from '../../../data/selectors/boosts.ts';
import { CampaignPromoCard, PartnersPromoCard } from './PromoCard.tsx';
import type { PromoCardProps } from './types.ts';

const BoostCard = memo(function BoostCard({ promo }: PromoCardProps<BoostPromoEntity>) {
  const rewards = useAppSelector(state => selectBoostActiveRewardTokens(state, promo.id));

  if (promo.campaign) {
    return (
      <CampaignPromoCard
        by={promo.by}
        campaignId={promo.campaign}
        partnerIds={promo.partners}
        tokens={rewards}
      />
    );
  } else if (promo.partners) {
    return <PartnersPromoCard partnerIds={promo.partners} tokens={rewards} />;
  }
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BoostCard;
