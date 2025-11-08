import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import type { CuratorEntity } from '../entities/curator.ts';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';
import { fetchCurators } from '../actions/curators.ts';
import type { CuratorConfig } from '../apis/config-types.ts';

/**
 * State containing Curator infos
 */
export type CuratorsState = NormalizedEntity<CuratorEntity>;

export const initialCuratorsState: CuratorsState = {
  byId: {},
  allIds: [],
};

export const curatorsSlice = createSlice({
  name: 'curators',
  initialState: initialCuratorsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchCurators.fulfilled, (sliceState, action) => {
      for (const curator of action.payload) {
        addCuratorToState(sliceState, curator);
      }
    });
  },
});

function addCuratorToState(sliceState: Draft<CuratorsState>, curatorConfig: CuratorConfig) {
  if (sliceState.byId[curatorConfig.id] === undefined) {
    const curator: CuratorEntity = {
      id: curatorConfig.id,
      name: curatorConfig.name,
      twitter: curatorConfig.twitter || '',
      website: curatorConfig.website || '',
      description: curatorConfig.description || '',
    };
    sliceState.byId[curator.id] = curator;
    sliceState.allIds.push(curator.id);
  }
}
