import {
  createAddressDataSelector,
  createGlobalDataSelector,
  createHasLoaderDispatchedRecentlyEvaluator,
  createShouldLoaderLoadRecentEvaluator,
  hasLoaderFulfilledOnce,
  isLoaderPending,
  isLoaderRejected,
} from '../data-loader-helpers.ts';

export const selectHasMerklRewardsDispatchedRecentlyForAnyUser = createGlobalDataSelector(
  'merklRewards',
  createHasLoaderDispatchedRecentlyEvaluator(15),
  5
);
export const selectFetchMerklRewardsLastDispatched = createGlobalDataSelector(
  'merklRewards',
  loader => loader?.lastDispatched?.timestamp || 0
);
export const selectMerklRewardsForUserShouldLoad = createAddressDataSelector(
  'merklRewards',
  createShouldLoaderLoadRecentEvaluator(30 * 60),
  5
);
export const selectMerklRewardsForUserHasFulfilledOnce = createAddressDataSelector(
  'merklRewards',
  hasLoaderFulfilledOnce
);
export const selectMerklRewardsForUserIsRejected = createAddressDataSelector(
  'merklRewards',
  isLoaderRejected
);
export const selectMerklRewardsForUserIsPending = createAddressDataSelector(
  'merklRewards',
  isLoaderPending
);
