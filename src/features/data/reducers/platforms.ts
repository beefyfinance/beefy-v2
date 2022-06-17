import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { PlatformEntity } from '../entities/platform';
import { NormalizedEntity } from '../utils/normalized-entity';
import { fetchPlatforms } from '../actions/platforms';
import { fetchAllVaults } from '../actions/vaults';
import { PlatformConfig, VaultConfig } from '../apis/config-types';

/**
 * State containing Vault infos
 */
export type PlatformsState = NormalizedEntity<PlatformEntity> & {
  filterIds: PlatformEntity['id'][];
  activeIds: PlatformEntity['id'][];
};
export const initialPlatformsState: PlatformsState = {
  byId: {},
  allIds: [],
  filterIds: [],
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
          addVaultPlatformToState(sliceState, vault.platformId, vault.status !== 'eol');
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

function addVaultPlatformToState(
  sliceState: WritableDraft<PlatformsState>,
  platformId: VaultConfig['platformId'],
  active: boolean
) {
  if (active && !sliceState.activeIds.includes(platformId)) {
    sliceState.activeIds.push(platformId);
  }
}

function addPlatformToState(
  sliceState: WritableDraft<PlatformsState>,
  platformConfig: PlatformConfig
) {
  if (sliceState.byId[platformConfig.id] === undefined) {
    const platform: PlatformEntity = {
      id: platformConfig.id,
      name: platformConfig.name,
    };
    sliceState.byId[platform.id] = platform;
    sliceState.allIds.push(platform.id);

    // keep list of filter platforms
    if (platformConfig.filter) {
      sliceState.filterIds.push(platform.id);
    }
  }
}
