import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import { getPartnerSrc } from '../../../../helpers/partnerSrc';

export const NexusCard = memo(function NexusCard() {
  const { t } = useTranslation();
  return (
    <PartnerCard
      logo={getPartnerSrc('nexus')}
      title={t('Nexus-Title')}
      content={t('Nexus-Content')}
      url="https://app.nexusmutual.io/cover/buy/get-quote?productId=14"
    />
  );
});
