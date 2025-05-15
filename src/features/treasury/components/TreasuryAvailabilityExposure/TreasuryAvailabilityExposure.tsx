import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectTreasuryExposureByAvailability } from '../../../data/selectors/treasury.ts';
import { cammelCaseToText } from '../../../data/utils/string-utils.ts';
import { TreasuryExposureChart } from '../ExposureChart/TreasuryExposureChart.tsx';

export const TreasuryAvailabilityExposure = () => {
  const availabilityExposure = useAppSelector(selectTreasuryExposureByAvailability);

  return <TreasuryExposureChart data={availabilityExposure} formatter={cammelCaseToText} />;
};
