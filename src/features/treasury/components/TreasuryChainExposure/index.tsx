import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByChain } from '../../../data/selectors/treasury';
import { ExposureChart } from '../ExposureChart';

export const TreasuryChainExposure = () => {
  const exposureByChain = useAppSelector(selectTreasuryExposureByChain);

  return <ExposureChart data={exposureByChain} type="chain" />;
};
