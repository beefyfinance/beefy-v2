import {
  createAddressChainDataSelector,
  createAddressDataSelector,
  hasLoaderFulfilledRecently,
  isLoaderPending,
  shouldLoaderLoadRecent,
} from '../data-loader-helpers.ts';

export const selectIsClmHarvestsForUserChainPending = createAddressChainDataSelector(
  'clmHarvests',
  isLoaderPending
);
export const selectIsClmHarvestsForUserPending = createAddressDataSelector(
  'clmHarvests',
  isLoaderPending
);
export const selectIsWalletTimelineForUserPending = createAddressDataSelector(
  'timeline',
  isLoaderPending
);
export const selectIsWalletTimelineForUserRecent = createAddressDataSelector(
  'timeline',
  hasLoaderFulfilledRecently,
  5
);
export const selectShouldInitDashboardForUserImpl = createAddressDataSelector(
  'dashboard',
  shouldLoaderLoadRecent,
  5
);
export const selectDashboardShouldLoadBalanceForChainUser = createAddressChainDataSelector(
  'balance',
  shouldLoaderLoadRecent,
  5
);
