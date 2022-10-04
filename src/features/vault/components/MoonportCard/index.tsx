import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import MoonpotLogo from '../../../../images/partners/moonpot.svg';

export const MoonpotCard = memo(function () {
  const { t } = useTranslation();
  return (
    <PartnerCard
      logo={MoonpotLogo}
      title={t('Moonpot-Title')}
      content={t('Moonpot-Content')}
      url="https://play.moonpot.com/"
    />
  );
});
