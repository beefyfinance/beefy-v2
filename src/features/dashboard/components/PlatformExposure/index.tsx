import React, { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey } from '../../../data/selectors/balance';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';
import type { ExposureDashboardChartLoaderProps } from '../ExposureChart/types';

const PlatformExposure = memo<ExposureDashboardChartLoaderProps>(function PlatformExposure({
  title,
  address,
}) {
  const platformExposureData = useAppSelector(state =>
    selectUserExposureByKey(state, 'platformId', address)
  );

  return <ExposureChart title={title} type="platform" data={platformExposureData} />;
});

export const PlatformExposureLoader = memo<ExposureDashboardChartLoaderProps>(
  function PlatformExposureLoader({ title, address }) {
    const isUserDataAvailable = useAppSelector(state =>
      selectIsUserBalanceAvailable(state, address)
    );

    if (isUserDataAvailable) {
      return <PlatformExposure address={address} title={title} />;
    }

    return null;
  }
);
