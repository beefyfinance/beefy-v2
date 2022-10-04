import React from 'react';
import { useTranslation } from 'react-i18next';

import QiDaoLogo from '../../../../images/partners/qidao.svg';

import { PartnerCard } from '../PartnerCard';

const QiDaoCard = () => {
  const { t } = useTranslation();

  return (
    <PartnerCard
      logo={QiDaoLogo}
      title={t('QiDao-Title')}
      content={t('QiDao-Content')}
      url="https://app.mai.finance/vaults"
    />
  );
};

export const QiDao = React.memo(QiDaoCard);
