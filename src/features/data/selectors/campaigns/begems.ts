import { createSelector } from '@reduxjs/toolkit';

import type { BeefyState } from '../../store/types.ts';
import { valueOrThrow } from '../../utils/selector-utils.ts';
import {
  createGlobalDataSelector,
  createHasLoaderDispatchedRecentlyEvaluator,
  hasLoaderFulfilledOnce,
} from '../data-loader-helpers.ts';

export const selectBeGemsFactoryAddress = (state: BeefyState) => state.ui.campaigns.begems.factory;
export const selectBeGemsSeasonNumbers = (state: BeefyState) =>
  state.ui.campaigns.begems.seasons.allNumbers;
export const selectBeGemsSeason = (state: BeefyState, seasonNumber: number) =>
  valueOrThrow(state.ui.campaigns.begems.seasons.configByNumber[seasonNumber]);
export const selectBeGemsSeasonData = (state: BeefyState, seasonNumber: number) =>
  valueOrThrow(state.ui.campaigns.begems.seasons.dataByNumber[seasonNumber]);

export const selectBeGemsSeasons = createSelector(
  selectBeGemsSeasonNumbers,
  (state: BeefyState) => state.ui.campaigns.begems.seasons.configByNumber,
  (seasonNumbers, seasons) => seasonNumbers.map(number => seasons[number])
);
export const selectIsBeGemsCampaignAvailable = createGlobalDataSelector(
  'beGemsCampaign',
  hasLoaderFulfilledOnce
);
export const selectHasBeGemsCampaignDispatchedRecently = createGlobalDataSelector(
  'beGemsCampaign',
  createHasLoaderDispatchedRecentlyEvaluator(15),
  5
);
