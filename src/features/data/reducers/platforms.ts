import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import type { PlatformEntity } from '../entities/platform.ts';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';
import { fetchPlatforms } from '../actions/platforms.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import type { PlatformConfig, VaultConfig } from '../apis/config-types.ts';

/**
 * State containing Vault infos
 */
export type PlatformsState = NormalizedEntity<PlatformEntity> & {
  usedIds: PlatformEntity['id'][];
  activeIds: PlatformEntity['id'][];
  byType: Partial<Record<NonNullable<PlatformEntity['type']>, PlatformEntity['id'][]>>;
};

export const initialPlatformsState: PlatformsState = {
  byId: {},
  allIds: [],
  activeIds: [],
  usedIds: [],
  byType: {},
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
      // @dev perf
      const seen: SeenIds = {
        activeIds: new Set(sliceState.activeIds),
        usedIds: new Set(sliceState.usedIds),
      };
      for (const vaults of Object.values(action.payload.byChainId)) {
        for (const vault of vaults) {
          addVaultToState(sliceState, seen, vault.config);
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

type IdsKey = 'activeIds' | 'usedIds';
type SeenIds = Record<IdsKey, Set<PlatformEntity['id']>>;

function addVaultToState(sliceState: Draft<PlatformsState>, seen: SeenIds, vault: VaultConfig) {
  const maybeAdd = (key: IdsKey, id: string | undefined) => {
    if (id && !seen[key].has(id)) {
      seen[key].add(id);
      sliceState[key].push(id);
    }
  };

  maybeAdd('usedIds', vault.platformId);
  maybeAdd('usedIds', vault.tokenProviderId);

  if (vault.status !== 'eol') {
    maybeAdd('activeIds', vault.platformId);
    maybeAdd('activeIds', vault.tokenProviderId);
  }
}

function addPlatformToState(sliceState: Draft<PlatformsState>, platformConfig: PlatformConfig) {
  if (sliceState.byId[platformConfig.id] === undefined) {
    const platform: PlatformEntity = {
      id: platformConfig.id,
      name: platformConfig.name,
      risks: platformConfig.risks || [],
      twitter: platformConfig.twitter || '',
      website: platformConfig.website || '',
      documentation: platformConfig.documentation || '',
      description: platformConfig.description || '',
      type: platformConfig.type || undefined,
    };
    sliceState.byId[platform.id] = platform;
    sliceState.allIds.push(platform.id);
    if (platform.type) {
      (sliceState.byType[platform.type] ??= []).push(platform.id);
    }
  }
}
