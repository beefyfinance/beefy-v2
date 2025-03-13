import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard/PartnerCard.tsx';
import { getPartnerSrc } from '../../../../helpers/partnerSrc.ts';

export const OpenCoverCard = memo(function OpenCoverCard() {
  const { t } = useTranslation();

  return (
    <PartnerCard
      logo={getPartnerSrc('openCover')}
      title={t('OpenCover-Title')}
      content={t('OpenCover-Content')}
      url={'https://opencover.com/beefy'}
    />
  );
});
