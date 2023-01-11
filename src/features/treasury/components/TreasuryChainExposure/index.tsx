import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByChain } from '../../../data/selectors/treasury';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';

export const TreasuryChainExposure = () => {
  const exposureByChain = useAppSelector(selectTreasuryExposureByChain);
  return (
    <>
      <ExposureBar data={exposureByChain} />
      <ExposureLegend data={exposureByChain} />
    </>
  );
};
