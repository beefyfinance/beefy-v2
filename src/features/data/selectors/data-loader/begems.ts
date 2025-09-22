import {
  createGlobalDataSelector,
  createHasLoaderDispatchedRecentlyEvaluator,
  hasLoaderFulfilledOnce,
} from '../data-loader-helpers.ts';

export const selectIsBeGemsCampaignAvailable = createGlobalDataSelector(
  'beGemsCampaign',
  hasLoaderFulfilledOnce
);
export const selectHasBeGemsCampaignDispatchedRecently = createGlobalDataSelector(
  'beGemsCampaign',
  createHasLoaderDispatchedRecentlyEvaluator(300),
  5
);
