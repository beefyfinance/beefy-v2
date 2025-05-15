import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectTreasuryTokensExposure } from '../../../data/selectors/treasury.ts';
import { TreasuryExposureChart } from '../ExposureChart/TreasuryExposureChart.tsx';

export const TreasuryTokensExposure = () => {
  const tokenExposure = useAppSelector(selectTreasuryTokensExposure);

  return <TreasuryExposureChart data={tokenExposure} />;
};
