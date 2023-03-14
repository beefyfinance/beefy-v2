import React from 'react';
import { useTranslation } from 'react-i18next';

import QiDaoLogo from '../../../../images/partners/qidao.svg';

import { PartnerCard } from '../PartnerCard';

const OliveCard = () => {
  const { t } = useTranslation();

  return (
    <PartnerCard
      logo={QiDaoLogo}
      title={t('Olive-Title')}
      content={t('Olive-Content')}
      url="https://oliveapp.finance/earn/vaults"
    />
  );
};

export const Olive = React.memo(OliveCard);
