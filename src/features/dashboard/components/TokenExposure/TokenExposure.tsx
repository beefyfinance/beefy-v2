import { memo } from 'react';
import { useAppSelector } from '../../../../store.ts';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader.ts';
import { ExposureChart } from '../ExposureChart/ExposureChart.tsx';
import type { ExposureDashboardChartLoaderProps } from '../ExposureChart/types.ts';

import { selectDashboardUserExposureByToken } from '../../../data/selectors/dashboard.ts';

const TokenExposure = memo(function TokenExposure({
  title,
  address,
}: ExposureDashboardChartLoaderProps) {
  const tokensExposureData = useAppSelector(state =>
    selectDashboardUserExposureByToken(state, address)
  );

  return <ExposureChart title={title} type="token" data={tokensExposureData} />;
});

export const TokenExposureLoader = memo(function TokenExposureLoader({
  title,
  address,
}: ExposureDashboardChartLoaderProps) {
  const isUserDataAvailable = useAppSelector(state => selectIsUserBalanceAvailable(state, address));

  if (isUserDataAvailable) {
    return <TokenExposure address={address} title={title} />;
  }

  return null;
});
