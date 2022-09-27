import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerCard } from '../PartnerCard';
import NexusLogo from '../../../../images/partners/nexus.svg';

export const NexusCard = memo(function () {
  const { t } = useTranslation();
  return (
    <PartnerCard
      logo={NexusLogo}
      title={t('Nexus-Title')}
      content={t('Nexus-Content')}
      url="https://app.nexusmutual.io/cover/buy/get-quote?address=0x453D4Ba9a2D594314DF88564248497F7D74d6b2C"
    />
  );
});
