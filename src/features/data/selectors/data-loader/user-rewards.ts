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
  loader => loader?.lastDispatched || 0
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
export const selectHasStellaSwapRewardsDispatchedRecentlyForAnyUser = createGlobalDataSelector(
  'stellaSwapRewards',
  createHasLoaderDispatchedRecentlyEvaluator(15),
  5
);
export const selectFetchStellaSwapRewardsLastDispatched = createGlobalDataSelector(
  'stellaSwapRewards',
  loader => loader?.lastDispatched || 0
);
export const selectStellaSwapRewardsForUserShouldLoad = createAddressDataSelector(
  'stellaSwapRewards',
  createShouldLoaderLoadRecentEvaluator(30 * 60),
  5
);
export const selectStellaSwapRewardsForUserHasFulfilledOnce = createAddressDataSelector(
  'stellaSwapRewards',
  hasLoaderFulfilledOnce
);
export const selectStellaSwapRewardsForUserIsRejected = createAddressDataSelector(
  'stellaSwapRewards',
  isLoaderRejected
);
export const selectStellaSwapRewardsForUserIsPending = createAddressDataSelector(
  'stellaSwapRewards',
  isLoaderPending
);
