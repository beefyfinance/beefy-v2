import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectTreasuryExposureByChain } from '../../../data/selectors/treasury.ts';
import { TreasuryExposureChart } from '../ExposureChart/TreasuryExposureChart.tsx';

export const TreasuryChainExposure = () => {
  const exposureByChain = useAppSelector(selectTreasuryExposureByChain);

  return <TreasuryExposureChart data={exposureByChain} />;
};
