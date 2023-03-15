import React from 'react';
import { useTranslation } from 'react-i18next';

import OliveLogo from '../../../../images/partners/olive.png';

import { PartnerCard } from '../PartnerCard';

const OliveCard = () => {
  const { t } = useTranslation();

  return (
    <PartnerCard
      logo={OliveLogo}
      title={t('Olive-Title')}
      content={t('Olive-Content')}
      url="https://oliveapp.finance/earn/vaults"
    />
  );
};

export const Olive = React.memo(OliveCard);
