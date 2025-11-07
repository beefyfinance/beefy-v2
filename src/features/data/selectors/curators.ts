import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import type { CuratorEntity } from '../entities/curator.ts';
import type { BeefyState } from '../store/types.ts';

export const selectCuratorById = createCachedSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.curators.byId,
  // get the user passed ID
  (_: BeefyState, curatorId: CuratorEntity['id']) => curatorId,
  // last function receives previous function outputs as parameters
  (byId, curatorId) => {
    const curator = byId[curatorId];
    if (curator === undefined) {
      throw new Error(`selectCuratorById: Unknown curator id ${curatorId}`);
    }
    return curator;
  }
)((_state: BeefyState, curatorId: CuratorEntity['id']) => curatorId);

export const selectCuratorByIdOrUndefined = createCachedSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.curators.byId,
  // get the user passed ID
  (_: BeefyState, curatorId: CuratorEntity['id']) => curatorId,
  // last function receives previous function outputs as parameters
  (byId, curatorId) => {
    return byId[curatorId];
  }
)((_state: BeefyState, curatorId: CuratorEntity['id']) => curatorId);

export const selectAllCurators = createSelector(
  (state: BeefyState) => state.entities.curators.allIds,
  (state: BeefyState) => state.entities.curators.byId,
  (ids, byId) => ids.map(id => byId[id])
);
