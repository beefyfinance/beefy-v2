import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectIsPoolTogether } from '../../../data/selectors/partners.ts';
import { PoolTogetherCard } from '../PoolTogetherCard/PoolTogetherCard.tsx';
import { PartnerCards } from '../PartnerCard/PartnerCards.tsx';

interface GamingCardsProps {
  vaultId: VaultEntity['id'];
}

export const GamingCards = memo<GamingCardsProps>(function GamingCards({ vaultId }) {
  const { t } = useTranslation();
  const isPoolTogether = useAppSelector(state => selectIsPoolTogether(state, vaultId));

  if (!isPoolTogether) {
    return null;
  }

  return (
    <PartnerCards title={t('Gaming')} openByDefault={true}>
      {isPoolTogether && <PoolTogetherCard vaultId={vaultId} />}
    </PartnerCards>
  );
});
