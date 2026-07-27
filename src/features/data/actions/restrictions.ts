import type { BeefyGeoCountryResponse } from '../apis/beefy/beefy-api-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import { featureFlag_geoCountryOverride } from '../utils/feature-flags.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export const fetchUserGeoCountry = createAppAsyncThunk<BeefyGeoCountryResponse, void>(
  'restrictions/fetchUserGeoCountry',
  async () => {
    const override = featureFlag_geoCountryOverride();
    if (override) {
      return { country: override };
    }

    const api = await getBeefyApi();

    return await api.getGeoCountry();
  }
);
