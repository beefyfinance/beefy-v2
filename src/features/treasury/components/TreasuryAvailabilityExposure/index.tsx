import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByAvailability } from '../../../data/selectors/treasury';
import { cammelCaseToText } from '../../../data/utils/string-utils';

import { TreasuryExposureChart } from '../ExposureChart';

export const TreasuryAvailabilityExposure = () => {
  const availabilityExposure = useAppSelector(selectTreasuryExposureByAvailability);

  return <TreasuryExposureChart data={availabilityExposure} formatter={cammelCaseToText} />;
};
