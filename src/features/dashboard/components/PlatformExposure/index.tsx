import React, { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey } from '../../../data/selectors/balance';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';
import { ExposureDashboardChartLoaderProps } from '../ExposureChart/types';

const PlatformExposure = memo<ExposureDashboardChartLoaderProps>(function ({ title }) {
  const platformExposureData = useAppSelector(state =>
    selectUserExposureByKey(state, 'platformId')
  );

  return <ExposureChart title={title} type="platform" data={platformExposureData} />;
});

export const PlatformExposureLoader = memo<ExposureDashboardChartLoaderProps>(function ({ title }) {
  const isUserDataAvailable = useAppSelector(selectIsUserBalanceAvailable);

  if (isUserDataAvailable) {
    return <PlatformExposure title={title} />;
  }

  return null;
});
