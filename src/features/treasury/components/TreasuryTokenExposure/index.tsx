import { useAppSelector } from '../../../../store';
import { selectTreasuryTokensExposure } from '../../../data/selectors/treasury';
import { TreasuryExposureChart } from '../ExposureChart';

export const TreasuryTokensExposure = () => {
  const tokenExposure = useAppSelector(selectTreasuryTokensExposure);

  return <TreasuryExposureChart data={tokenExposure} />;
};
