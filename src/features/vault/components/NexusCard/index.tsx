import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { InsuranceCard } from '../InsuranceCard';
import NexusLogo from '../../../../images/partners/nexus.svg';

export const NexusCard = memo(function () {
  const { t } = useTranslation();
  return (
    <InsuranceCard
      logo={NexusLogo}
      title={t('Nexus-Title')}
      subtitle={t('Nexus-SubTitle')}
      content={t('Nexus-Content')}
      buttonUrl="https://app.nexusmutual.io/cover/buy/get-quote?address=0x453D4Ba9a2D594314DF88564248497F7D74d6b2C"
      buttonText={t('Nexus-Btn')}
    />
  );
});
