import React, { useMemo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByChain } from '../../../data/selectors/treasury';
import { getTopNArray } from '../../../data/utils/array-utils';
import { ExposureChart } from '../ExposureChart';

export const TreasuryChainExposure = () => {
  const exposureByChain = useAppSelector(selectTreasuryExposureByChain);

  const data = useMemo(() => {
    return getTopNArray(exposureByChain, 'percentage');
  }, [exposureByChain]);

  return <ExposureChart data={data} type="chain" />;
};
