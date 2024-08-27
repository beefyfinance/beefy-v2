import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';
import type { ExposureDashboardChartLoaderProps } from '../ExposureChart/types';
import { selectDashboardUserExposureByPlatform } from '../../../data/selectors/dashboard';

const PlatformExposure = memo<ExposureDashboardChartLoaderProps>(function PlatformExposure({
  title,
  address,
}) {
  const platformExposureData = useAppSelector(state =>
    selectDashboardUserExposureByPlatform(state, address)
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
