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
  activeIds: PlatformEntity['id'][];
  byType: Partial<Record<NonNullable<PlatformEntity['type']>, PlatformEntity['id'][]>>;
};

export const initialPlatformsState: PlatformsState = {
  byId: {},
  allIds: [],
  activeIds: [],
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
      for (const vaults of Object.values(action.payload.byChainId)) {
        for (const vault of vaults) {
          addVaultToState(sliceState, vault.config);
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
      risks: tempFilterRisks(platformConfig.risks || []), // FIXME remove once we support multiple risks types
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

function tempFilterRisks(risks: string[]) {
  return risks.filter(risk => risk === 'NO_TIMELOCK');
}
