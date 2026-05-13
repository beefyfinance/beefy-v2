import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { initPoints } from '../actions/points.ts';
import type { PointStructureEntity } from '../entities/points.ts';
import type { PointsState } from './points-types.ts';

export const initialPointsState: PointsState = {
  byId: {},
  allIds: [],
};

export const pointsSlice = createSlice({
  name: 'points',
  initialState: initialPointsState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(initPoints.fulfilled, (sliceState, action) => {
      addPointsToState(sliceState, action.payload.structures);
    });
  },
});

function addPointsToState(sliceState: Draft<PointsState>, structures: PointStructureEntity[]) {
  const allIds: PointsState['allIds'] = [];
  const byId: PointsState['byId'] = {};
  for (const structure of structures) {
    allIds.push(structure.id);
    byId[structure.id] = structure;
  }
  sliceState.allIds = allIds;
  sliceState.byId = byId;
}

export const pointsReducer = pointsSlice.reducer;
