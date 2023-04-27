import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import type { NormalizedEntity } from '../utils/normalized-entity';
import { fetchStrategyTypes } from '../actions/strategy-types';
import type { StrategyTypeEntity } from '../entities/strategy-type';
import type { StrategyTypeConfig } from '../apis/config-types';

export type StrategyTypesState = NormalizedEntity<StrategyTypeEntity>;
export const initialStrategyTypes: StrategyTypesState = { byId: {}, allIds: [] };

export const strategyTypesSlice = createSlice({
  name: 'strategyTypes',
  initialState: initialStrategyTypes,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchStrategyTypes.fulfilled, (sliceState, action) => {
      for (const type of action.payload) {
        addTypeToState(sliceState, type);
      }
    });
  },
});

function addTypeToState(
  sliceState: Draft<StrategyTypesState>,
  strategyTypeConfig: StrategyTypeConfig
) {
  if (sliceState.byId[strategyTypeConfig.id] === undefined) {
    const strategyType: StrategyTypeEntity = {
      id: strategyTypeConfig.id,
      name: strategyTypeConfig.name,
    };
    sliceState.byId[strategyType.id] = strategyType;
    sliceState.allIds.push(strategyType.id);
  }
}
