import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';
import type { ExposureDashboardChartLoaderProps } from '../ExposureChart/types';
import { selectDashboardUserExposureByToken } from '../../../data/selectors/balance';

const TokenExposure = memo<ExposureDashboardChartLoaderProps>(function TokenExposure({
  title,
  address,
}) {
  const tokensExposureData = useAppSelector(state =>
    selectDashboardUserExposureByToken(state, address)
  );

  return <ExposureChart title={title} type="token" data={tokensExposureData} />;
});

export const TokenExposureLoader = memo<ExposureDashboardChartLoaderProps>(
  function TokenExposureLoader({ title, address }) {
    const isUserDataAvailable = useAppSelector(state =>
      selectIsUserBalanceAvailable(state, address)
    );

    if (isUserDataAvailable) {
      return <TokenExposure address={address} title={title} />;
    }

    return null;
  }
);
