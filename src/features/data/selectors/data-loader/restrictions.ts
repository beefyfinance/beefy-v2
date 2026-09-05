import {
  DEFAULT_DISPATCHED_RECENT_SECONDS,
  createGlobalDataSelector,
  hasLoaderSettledOnce,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectShouldInitGeoCountry = createGlobalDataSelector(
  'geoCountry',
  shouldLoaderLoadOnce,
  DEFAULT_DISPATCHED_RECENT_SECONDS
);

export const selectIsGeoCountrySettled = createGlobalDataSelector(
  'geoCountry',
  hasLoaderSettledOnce
);
