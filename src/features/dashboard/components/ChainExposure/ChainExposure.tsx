import { memo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/balance.ts';
import { selectDashboardUserExposureByChain } from '../../../data/selectors/dashboard.ts';
import { ExposureChart } from '../ExposureChart/ExposureChart.tsx';
import type { ExposureDashboardChartLoaderProps } from '../ExposureChart/types.ts';

const ChainExposure = memo(function ChainExposure({
  title,
  address,
}: ExposureDashboardChartLoaderProps) {
  const chainExposureData = useAppSelector(state =>
    selectDashboardUserExposureByChain(state, address)
  );
  return <ExposureChart title={title} type="chain" data={chainExposureData} />;
});

export const ChainExposureLoader = memo(function ChainExposureLoader({
  title,
  address,
}: ExposureDashboardChartLoaderProps) {
  const isUserDataAvailable = useAppSelector(state => selectIsUserBalanceAvailable(state, address));

  if (isUserDataAvailable) {
    return <ChainExposure address={address} title={title} />;
  }

  return null;
});
