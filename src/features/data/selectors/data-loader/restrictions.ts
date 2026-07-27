import {
  createGlobalDataSelector,
  hasLoaderSettledOnce,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';

export const selectShouldInitGeoCountry = createGlobalDataSelector(
  'geoCountry',
  shouldLoaderLoadOnce
);

export const selectIsGeoCountrySettled = createGlobalDataSelector(
  'geoCountry',
  hasLoaderSettledOnce
);
