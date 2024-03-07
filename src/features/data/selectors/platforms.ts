import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { PlatformEntity } from '../entities/platform';
import { createCachedSelector } from 're-reselect';

export const selectPlatformById = createCachedSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.platforms.byId,
  // get the user passed ID
  (_: BeefyState, platformId: PlatformEntity['id']) => platformId,
  // last function receives previous function outputs as parameters
  (byId, platformId) => {
    const platform = byId[platformId];
    if (platform === undefined) {
      throw new Error(`selectPlatformById: Unknown platform id ${platformId}`);
    }
    return platform;
  }
)((state: BeefyState, platformId: PlatformEntity['id']) => platformId);

export const selectPlatformByIdOrUndefined = createCachedSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.platforms.byId,
  // get the user passed ID
  (_: BeefyState, platformId: PlatformEntity['id']) => platformId,
  // last function receives previous function outputs as parameters
  (byId, platformId) => {
    return byId[platformId];
  }
)((state: BeefyState, platformId: PlatformEntity['id']) => platformId);

export const selectAllPlatforms = createSelector(
  (state: BeefyState) => state.entities.platforms.allIds,
  (state: BeefyState) => state.entities.platforms.byId,
  (ids, byId) => ids.map(id => byId[id])
);

/** All active platforms (vault.status != eol) that are allowed to be in the filter */
export const selectFilterPlatforms = createSelector(
  (state: BeefyState) => state.entities.platforms.allIds,
  (state: BeefyState) => state.entities.platforms.activeIds,
  (state: BeefyState) => state.entities.platforms.byId,
  (allIds, activeIds, byId) => activeIds.filter(id => allIds.includes(id)).map(id => byId[id]!)
);
