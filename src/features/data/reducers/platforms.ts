import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import type { PlatformEntity } from '../entities/platform';
import type { NormalizedEntity } from '../utils/normalized-entity';
import { fetchPlatforms } from '../actions/platforms';
import { fetchAllVaults } from '../actions/vaults';
import type { PlatformConfig, VaultConfig } from '../apis/config-types';

/**
 * State containing Vault infos
 */
export type PlatformsState = NormalizedEntity<PlatformEntity> & {
  activeIds: PlatformEntity['id'][];
};
export const initialPlatformsState: PlatformsState = {
  byId: {},
  allIds: [],
  activeIds: [],
};

export const platformsSlice = createSlice({
  name: 'platforms',
  initialState: initialPlatformsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const vaults of Object.values(action.payload.byChainId)) {
        for (const vault of vaults) {
          addVaultToState(sliceState, vault);
        }
      }
    });

    builder.addCase(fetchPlatforms.fulfilled, (sliceState, action) => {
      for (const platform of action.payload) {
        addPlatformToState(sliceState, platform);
      }
    });
  },
});

function addVaultToState(sliceState: Draft<PlatformsState>, vault: VaultConfig) {
  if (vault.status !== 'eol') {
    if (vault.platformId && !sliceState.activeIds.includes(vault.platformId)) {
      sliceState.activeIds.push(vault.platformId);
    }
    if (vault.tokenProviderId && !sliceState.activeIds.includes(vault.tokenProviderId)) {
      sliceState.activeIds.push(vault.tokenProviderId);
    }
  }
}

function addPlatformToState(sliceState: Draft<PlatformsState>, platformConfig: PlatformConfig) {
  if (sliceState.byId[platformConfig.id] === undefined) {
    const platform: PlatformEntity = {
      id: platformConfig.id,
      name: platformConfig.name,
    };
    sliceState.byId[platform.id] = platform;
    sliceState.allIds.push(platform.id);
  }
}
