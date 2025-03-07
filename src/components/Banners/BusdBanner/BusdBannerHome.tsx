import { memo } from 'react';
import { useAppSelector } from '../../../store.ts';
import { selectUserDepositedVaultIdsForAsset } from '../../../features/data/selectors/balance.ts';
import { BusdBanner } from './BusdBanner.tsx';

export const BusdBannerHome = memo(function BusdBannerHome() {
  const vaultIds = useAppSelector(state => selectUserDepositedVaultIdsForAsset(state, 'BUSD'));
  return vaultIds.length ? <BusdBanner /> : null;
});
