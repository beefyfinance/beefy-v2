import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserTokenExposure } from '../../../data/selectors/balance';
import { ExposureChart } from '../ExposureChart';

export const TokenExposure = memo(function () {
  const { t } = useTranslation();

  const tokensExposureData = useAppSelector(selectUserTokenExposure);

  return <ExposureChart title={t('Exposure-Tokens')} type="token" data={tokensExposureData} />;
});
