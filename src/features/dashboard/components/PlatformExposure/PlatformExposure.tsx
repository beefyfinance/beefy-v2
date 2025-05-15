import { memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/balance.ts';
import { selectDashboardUserExposureByPlatform } from '../../../data/selectors/dashboard.ts';
import { ExposureChart } from '../ExposureChart/ExposureChart.tsx';
import type { ExposureDashboardChartLoaderProps } from '../ExposureChart/types.ts';

const PlatformExposure = memo(function PlatformExposure({
  title,
  address,
}: ExposureDashboardChartLoaderProps) {
  const platformExposureData = useAppSelector(state =>
    selectDashboardUserExposureByPlatform(state, address)
  );
  return <ExposureChart title={title} type="platform" data={platformExposureData} />;
});

export const PlatformExposureLoader = memo(function PlatformExposureLoader({
  title,
  address,
}: ExposureDashboardChartLoaderProps) {
  const isUserDataAvailable = useAppSelector(state => selectIsUserBalanceAvailable(state, address));

  if (isUserDataAvailable) {
    return <PlatformExposure address={address} title={title} />;
  }

  return null;
});
