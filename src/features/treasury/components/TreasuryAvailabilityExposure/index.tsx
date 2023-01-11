import React from 'react';
import { useAppSelector } from '../../../../store';
import { selectTreasuryExposureByAvailability } from '../../../data/selectors/treasury';
import { cammelCaseToText } from '../../../data/utils/string-utils';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';

export const TreasuryAvailabilityExposure = () => {
  const availabilityExposure = useAppSelector(selectTreasuryExposureByAvailability);
  return (
    <>
      <ExposureBar data={availabilityExposure} />
      <ExposureLegend formatter={cammelCaseToText} data={availabilityExposure} />
    </>
  );
};
