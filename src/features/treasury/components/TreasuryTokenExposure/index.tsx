import React, { useMemo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryTokensExposure } from '../../../data/selectors/treasury';
import { getTopNArray } from '../../../data/utils/array-utils';
import { ExposureChart } from '../ExposureChart';

export const TreasuryTokensExposure = () => {
  const tokenExposure = useAppSelector(selectTreasuryTokensExposure);

  const data = useMemo(() => {
    return getTopNArray(tokenExposure, 'percentage');
  }, [tokenExposure]);

  return <ExposureChart data={data} />;
};
