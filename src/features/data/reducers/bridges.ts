import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import type { BridgeEntity } from '../entities/bridge';
import type { NormalizedEntity } from '../utils/normalized-entity';
import { fetchBridges } from '../actions/bridges';
import type { BridgeConfig } from '../apis/config-types';

export type BridgesState = NormalizedEntity<BridgeEntity>;

export const initialBridgesState: BridgesState = {
  byId: {},
  allIds: [],
};

export const bridgesSlice = createSlice({
  name: 'bridges',
  initialState: initialBridgesState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchBridges.fulfilled, (sliceState, action) => {
      for (const bridge of action.payload) {
        addBridgeToState(sliceState, bridge);
      }
    });
  },
});

function addBridgeToState(sliceState: Draft<BridgesState>, bridgeConfig: BridgeConfig) {
  if (sliceState.byId[bridgeConfig.id] === undefined) {
    const bridge: BridgeEntity = {
      id: bridgeConfig.id,
      name: bridgeConfig.name,
      tagName: bridgeConfig.tagName || bridgeConfig.name,
      website: bridgeConfig.website,
    };
    sliceState.byId[bridge.id] = bridge;
    sliceState.allIds.push(bridge.id);
  }
}
