import React, { useMemo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByAvailability } from '../../../data/selectors/treasury';
import { getTopNArray } from '../../../data/utils/array-utils';
import { cammelCaseToText } from '../../../data/utils/string-utils';

import { ExposureChart } from '../ExposureChart';

export const TreasuryAvailabilityExposure = () => {
  const availabilityExposure = useAppSelector(selectTreasuryExposureByAvailability);

  const data = useMemo(() => {
    return getTopNArray(availabilityExposure, 'percentage');
  }, [availabilityExposure]);

  return <ExposureChart data={data} formatter={cammelCaseToText} />;
};
