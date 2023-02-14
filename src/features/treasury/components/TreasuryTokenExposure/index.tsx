import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryTokensExposure } from '../../../data/selectors/treasury';
import { ExposureChart } from '../ExposureChart';

export const TreasuryTokensExposure = () => {
  const tokenExposure = useAppSelector(selectTreasuryTokensExposure);

  return <ExposureChart data={tokenExposure} />;
};
