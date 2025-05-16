import { memo } from 'react';
import { selectHasUserDepositedOnChain } from '../../../features/data/selectors/balance.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { FraxBanner } from './FraxBanner.tsx';

export const FraxBannerHome = memo(function FraxBannerHome() {
  const hasDeposits = useAppSelector(state => selectHasUserDepositedOnChain(state, 'fraxtal'));
  return hasDeposits ? <FraxBanner /> : null;
});
