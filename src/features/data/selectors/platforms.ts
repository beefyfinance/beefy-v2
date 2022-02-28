import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { PlatformEntity } from '../entities/platform';

export const selectPlatformById = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.platforms.byId,
  // get the user passed ID
  (_: BeefyState, platformId: PlatformEntity['id']) => platformId,
  // last function receives previous function outputs as parameters
  (byId, platformId) => {
    if (byId[platformId] === undefined) {
      throw new Error(`selectPlatformById: Unknown platform id ${platformId}`);
    }
    return byId[platformId];
  }
);

export const selectAllPlatform = createSelector(
  (state: BeefyState) => state.entities.platforms.allIds.map(id => selectPlatformById(state, id)),
  all => all
);
