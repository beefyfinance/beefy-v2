import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey } from '../../../data/selectors/balance';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';

const ChainExposure = memo(function () {
  const { t } = useTranslation();

  const chainExposureData = useAppSelector(state => selectUserExposureByKey(state, 'chainId'));

  return <ExposureChart title={t('Exposure-Chain')} type="chain" data={chainExposureData} />;
});

export const ChainExposureLoader = memo(function () {
  const isUserDataAvailable = useAppSelector(selectIsUserBalanceAvailable);

  if (isUserDataAvailable) {
    return <ChainExposure />;
  }

  return null;
});
