import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../store/types.ts';
import { valueOrThrow } from '../../utils/selector-utils.ts';
import {
  createGlobalDataSelector,
  createHasLoaderDispatchedRecentlyEvaluator,
  hasLoaderFulfilledOnce,
} from '../data-loader-helpers.ts';
import type { SeasonConfig } from '../../reducers/campaigns/begems-types.ts';
import { getUnixNow } from '../../../../helpers/date.ts';

export const selectBeGemsFactoryAddress = (state: BeefyState) => state.ui.campaigns.begems.factory;
export const selectBeGemsSeasonNumbers = (state: BeefyState) =>
  state.ui.campaigns.begems.seasons.allNumbers;
export const selectBeGemsSeason = (state: BeefyState, seasonNumber: number) =>
  valueOrThrow(state.ui.campaigns.begems.seasons.configByNumber[seasonNumber]);
export const selectBeGemsSeasonData = (state: BeefyState, seasonNumber: number) =>
  valueOrThrow(state.ui.campaigns.begems.seasons.dataByNumber[seasonNumber]);

export const selectBeGemsTokenSeasonData = (state: BeefyState, seasonNumber: number) => {
  const data = selectBeGemsSeasonData(state, seasonNumber);
  if (data.type !== 'token') {
    throw new Error(`Expected season data type to be 'token', got '${data.type}'`);
  }
  return data;
};

export const selectBeGemsPointsSeasonData = (state: BeefyState, seasonNumber: number) => {
  const data = selectBeGemsSeasonData(state, seasonNumber);
  if (data.type !== 'points') {
    throw new Error(`Expected season data type to be 'points', got '${data.type}'`);
  }
  return data;
};

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
  createHasLoaderDispatchedRecentlyEvaluator(300),
  5
);

export const selectBeGemsSeasonFaqs = (state: BeefyState, seasonNumber: number) =>
  selectBeGemsSeason(state, seasonNumber).faqs;

export const selectBeGemsDefaultSeason = createSelector(
  [selectBeGemsSeasons],
  (seasons: SeasonConfig[]) => {
    const now = getUnixNow();
    const latestActive = seasons.findLast(season => now >= season.startTime);
    return latestActive?.number || seasons[0].number;
  }
);

export const selectBeGemsSeasonExplainer = (state: BeefyState, seasonNumber: number) => {
  const season = selectBeGemsSeason(state, seasonNumber);
  return season.explainer;
};

export const selectBeGemsSeasonType = (state: BeefyState, seasonNumber: number) => {
  const season = selectBeGemsSeason(state, seasonNumber);
  return season.type;
};

export const selectBeGemsUserSeasonData = (
  state: BeefyState,
  userAddress: string,
  seasonNumber: number
) => state.ui.campaigns.begems.seasons.userDataByAddress[userAddress.toLowerCase()]?.[seasonNumber];

const EMPTY_POINTS_DATA = {
  type: 'points',
  points: undefined,
  position: undefined,
};

export const selectBeGemsPointsUserSeasonData = (
  state: BeefyState,
  userAddress: string | undefined,
  seasonNumber: number
) => {
  const data =
    (userAddress && selectBeGemsUserSeasonData(state, userAddress, seasonNumber)) ||
    EMPTY_POINTS_DATA;
  if (data.type !== 'points') {
    throw new Error(`Expected season data type to be 'points', got '${data.type}'`);
  }
  return data;
};
