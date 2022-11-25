import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserTokenExposure } from '../../../data/selectors/balance';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';

const TokenExposure = memo(function () {
  const { t } = useTranslation();

  const tokensExposureData = useAppSelector(state => selectUserTokenExposure(state));

  return <ExposureChart title={t('Exposure-Tokens')} type="token" data={tokensExposureData} />;
});

export const TokenExposureLoader = memo(function () {
  const isUserDataAvailable = useAppSelector(selectIsUserBalanceAvailable);

  if (isUserDataAvailable) {
    return <TokenExposure />;
  }

  return null;
});
