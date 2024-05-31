import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByAvailability } from '../../../data/selectors/treasury';
import { cammelCaseToText } from '../../../data/utils/string-utils';

import { ExposureChart } from '../ExposureChart';

export const TreasuryAvailabilityExposure = () => {
  const availabilityExposure = useAppSelector(selectTreasuryExposureByAvailability);

  return <ExposureChart data={availabilityExposure} formatter={cammelCaseToText} />;
};
