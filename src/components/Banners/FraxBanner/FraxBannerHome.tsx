import { memo } from 'react';
import { useAppSelector } from '../../../store.ts';
import { selectHasUserDepositedOnChain } from '../../../features/data/selectors/balance.ts';
import { FraxBanner } from './FraxBanner.tsx';

export const FraxBannerHome = memo(function FraxBannerHome() {
  const hasDeposits = useAppSelector(state => selectHasUserDepositedOnChain(state, 'fraxtal'));
  return hasDeposits ? <FraxBanner /> : null;
});
