import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByChain } from '../../../data/selectors/treasury';
import { TreasuryExposureChart } from '../ExposureChart';

export const TreasuryChainExposure = () => {
  const exposureByChain = useAppSelector(selectTreasuryExposureByChain);

  return <TreasuryExposureChart data={exposureByChain} />;
};
