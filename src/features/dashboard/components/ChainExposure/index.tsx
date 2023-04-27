import React, { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectUserExposureByKey } from '../../../data/selectors/balance';
import { selectIsUserBalanceAvailable } from '../../../data/selectors/data-loader';
import { ExposureChart } from '../ExposureChart';
import type { ExposureDashboardChartLoaderProps } from '../ExposureChart/types';

const ChainExposure = memo<ExposureDashboardChartLoaderProps>(function ChainExposure({ title }) {
  const chainExposureData = useAppSelector(state => selectUserExposureByKey(state, 'chainId'));

  return <ExposureChart title={title} type="chain" data={chainExposureData} />;
});

export const ChainExposureLoader = memo<ExposureDashboardChartLoaderProps>(
  function ChainExposureLoader({ title }) {
    const isUserDataAvailable = useAppSelector(selectIsUserBalanceAvailable);

    if (isUserDataAvailable) {
      return <ChainExposure title={title} />;
    }

    return null;
  }
);
