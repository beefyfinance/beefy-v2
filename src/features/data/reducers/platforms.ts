import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { fetchAllVaults } from '../actions/vaults';
import { ChainEntity } from '../entities/chain';
import { PlatformEntity } from '../entities/platform';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type PlatformsState = NormalizedEntity<PlatformEntity> & {
  byChainId: {
    [chainId: ChainEntity['id']]: PlatformEntity['id'][];
  };
};
export const initialPlatformsState: PlatformsState = { byId: {}, allIds: [], byChainId: {} };

export const platformsSlice = createSlice({
  name: 'platforms',
  initialState: initialPlatformsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const [chainId, vaults] of Object.entries(action.payload.byChainId)) {
        for (const vault of vaults) {
          addPlatformToState(sliceState, chainId, vault.platform);
        }
      }
    });
  },
});

function addPlatformToState(
  sliceState: WritableDraft<PlatformsState>,
  chainId: ChainEntity['id'],
  platformName: string
) {
  // for now, platforms Id is their name
  const platformId = platformName.toLowerCase();
  if (sliceState.byId[platformId] === undefined) {
    const platform: PlatformEntity = {
      id: platformId,
      name: platformName,
    };
    sliceState.byId[platformId] = platform;
    sliceState.allIds.push(platformId);

    // add to chain state
    if (sliceState.byChainId[chainId] === undefined) {
      sliceState.byChainId[chainId] = [];
    }
    sliceState.byChainId[chainId].push(platformId);
  }
}
