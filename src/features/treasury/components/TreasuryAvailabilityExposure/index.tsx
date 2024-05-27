import React, { useMemo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByAvailability } from '../../../data/selectors/treasury';
import { cammelCaseToText } from '../../../data/utils/string-utils';

import { ExposureChart } from '../ExposureChart';
import { getTopNArray } from '../../../data/utils/array-utils';
import { BIG_ZERO } from '../../../../helpers/big-number';

export const TreasuryAvailabilityExposure = () => {
  const availabilityExposure = useAppSelector(selectTreasuryExposureByAvailability);
  const topSix = useMemo(
    () =>
      getTopNArray(availabilityExposure, 'percentage', 6, {
        key: 'others',
        value: BIG_ZERO,
        percentage: 0,
      }),
    [availabilityExposure]
  );

  return <ExposureChart data={topSix} formatter={cammelCaseToText} type={'generic'} />;
};
