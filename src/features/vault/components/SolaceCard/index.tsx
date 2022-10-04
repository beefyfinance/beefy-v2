import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import SolaceLogo from '../../../../images/partners/solace.svg';

export const SolaceCard = memo(function () {
  const { t } = useTranslation();
  return (
    <PartnerCard
      logo={SolaceLogo}
      title={t('Solace-Title')}
      content={t('Solace-Content')}
      url="https://app.solace.fi/cover"
    />
  );
});
