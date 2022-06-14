import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { PlatformEntity } from '../entities/platform';
import { NormalizedEntity } from '../utils/normalized-entity';
import { fetchPlatforms } from '../actions/platforms';
import { PlatformConfig } from '../apis/platform/platform-types';

/**
 * State containing Vault infos
 */
export type PlatformsState = NormalizedEntity<PlatformEntity> & {
  filterIds: PlatformEntity['id'][];
};
export const initialPlatformsState: PlatformsState = { byId: {}, allIds: [], filterIds: [] };

export const platformsSlice = createSlice({
  name: 'platforms',
  initialState: initialPlatformsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchPlatforms.fulfilled, (sliceState, action) => {
      for (const platform of action.payload) {
        addPlatformToState(sliceState, platform);
      }
    });
  },
});

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
