import { memo } from 'react';
import type { AirdropPromoEntity } from '../../../data/entities/promo.ts';
import type { PromoCardProps } from './types.ts';
import { CampaignPromoCard, PartnersPromoCard } from './PromoCard.tsx';

const AirdropCard = memo(function AirdropCard({ promo }: PromoCardProps<AirdropPromoEntity>) {
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

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default AirdropCard;
