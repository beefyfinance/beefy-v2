import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey } from '../../../data/selectors/balance';
import { ExposureChart } from '../ExposureChart';

export const PlatformExposure = memo(function () {
  const { t } = useTranslation();

  const platformExposureData = useAppSelector(state =>
    selectUserExposureByKey(state, 'platformId')
  );

  return (
    <ExposureChart title={t('Exposure-Platform')} type="platform" data={platformExposureData} />
  );
});
