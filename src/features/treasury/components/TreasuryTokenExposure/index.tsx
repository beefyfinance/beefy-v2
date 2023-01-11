import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryTokensExposure } from '../../../data/selectors/treasury';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';

export const TreasuryTokensExposure = () => {
  const tokenExposure = useAppSelector(selectTreasuryTokensExposure);
  return (
    <>
      <ExposureBar data={tokenExposure} />
      <ExposureLegend data={tokenExposure} />
    </>
  );
};
