import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey } from '../../../data/selectors/balance';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';

const PlatformExposure = memo(function () {
  const { t } = useTranslation();

  const platformExposureData = useAppSelector(state =>
    selectUserExposureByKey(state, 'platformId')
  );

  return (
    <ExposureChart title={t('Exposure-Platform')} type="platform" data={platformExposureData} />
  );
});

export const PlatformExposureLoader = memo(function () {
  const isUserDataAvailable = useAppSelector(selectIsUserBalanceAvailable);

  if (isUserDataAvailable) {
    return <PlatformExposure />;
  }

  return null;
});
