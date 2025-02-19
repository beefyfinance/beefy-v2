import { memo } from 'react';
import type { PromoCardProps } from './types';
import { CampaignPromoCard, PartnersPromoCard } from './PromoCard';
import { useAppSelector } from '../../../../store';
import { selectBoostActiveRewardTokens } from '../../../data/selectors/boosts';
import type { BoostPromoEntity } from '../../../data/entities/promo';

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

// eslint-disable-next-line no-restricted-syntax
export default BoostCard;
