import { memo } from 'react';
import type { OffChainPromoEntity } from '../../../data/entities/promo';
import type { PromoCardProps } from './types';
import { CampaignPromoCard, PartnersPromoCard } from './PromoCard';

const OffChainCard = memo(function OffChainCard({ promo }: PromoCardProps<OffChainPromoEntity>) {
  if (promo.campaign) {
    return (
      <CampaignPromoCard
        by={promo.by}
        campaignId={promo.campaign}
        partnerIds={promo.partners}
        tokens={promo.rewards}
      />
    );
  } else if (promo.partners) {
    return <PartnersPromoCard partnerIds={promo.partners} tokens={promo.rewards} />;
  }
});

// eslint-disable-next-line no-restricted-syntax
export default OffChainCard;
