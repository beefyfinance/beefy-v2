import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey } from '../../../data/selectors/balance';
import { ExposureChart } from '../ExposureChart';

export const ChainExposure = memo(function () {
  const { t } = useTranslation();

  const chainExposureData = useAppSelector(state => selectUserExposureByKey(state, 'chainId'));

  return <ExposureChart title={t('Exposure-Chain')} type="chain" data={chainExposureData} />;
});
