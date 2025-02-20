import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import { getPartnerSrc } from '../../../../helpers/partnerSrc';

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
