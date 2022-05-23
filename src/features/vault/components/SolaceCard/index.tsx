import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { InsuranceCard } from '../InsuranceCard';
import SolaceLogo from '../../../../images/partners/solace.svg';

export const SolaceCard = memo(function () {
  const { t } = useTranslation();
  return (
    <InsuranceCard
      logo={SolaceLogo}
      title={t('Solace-Title')}
      subtitle={t('Solace-SubTitle')}
      content={t('Solace-Content')}
      buttonUrl="https://app.solace.fi/cover"
      buttonText={t('Solace-Btn')}
    />
  );
});
