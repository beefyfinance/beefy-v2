import { memo } from 'react';
import { selectUserDepositedVaultIdsForAsset } from '../../../features/data/selectors/balance.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { BusdBanner } from './BusdBanner.tsx';

export const BusdBannerHome = memo(function BusdBannerHome() {
  const vaultIds = useAppSelector(state => selectUserDepositedVaultIdsForAsset(state, 'BUSD'));
  return vaultIds.length ? <BusdBanner /> : null;
});
