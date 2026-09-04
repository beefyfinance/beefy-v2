import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import type { PlatformEntity } from '../entities/platform.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { selectVaultById } from './vaults.ts';
import { isDefined } from '../utils/array-utils.ts';

export const selectPlatformById = createCachedSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.platforms.byId,
  // get the user passed ID
  (_: BeefyState, platformId: PlatformEntity['id']) => platformId,
  // last function receives previous function outputs as parameters
  (byId, platformId) => {
    const platform = byId[platformId];
    if (platform === undefined) {
      throw new Error(`selectPlatformById: Unknown platform id ${platformId}`);
    }
    return platform;
  }
)((_state: BeefyState, platformId: PlatformEntity['id']) => platformId);

export const selectPlatformByIdOrUndefined = createCachedSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.platforms.byId,
  // get the user passed ID
  (_: BeefyState, platformId: PlatformEntity['id']) => platformId,
  // last function receives previous function outputs as parameters
  (byId, platformId) => {
    return byId[platformId];
  }
)((_state: BeefyState, platformId: PlatformEntity['id']) => platformId);

/** All platforms actually used by a vault that loaded */
export const selectUsedPlatforms = createSelector(
  (state: BeefyState) => state.entities.platforms.usedIds,
  (state: BeefyState) => state.entities.platforms.byId,
  (usedIds, byId) => usedIds.map(id => byId[id]).filter(isDefined)
);

/** All active platforms (vault.status !== eol) that are allowed to be in the filter */
export const selectFilterPlatforms = createSelector(
  (state: BeefyState) => state.entities.platforms.activeIds,
  (state: BeefyState) => state.entities.platforms.byId,
  (activeIds, byId) => activeIds.map(id => byId[id]).filter(isDefined)
);

/** All platforms with `type: 'alm'` exception conic which manages curve not CL */
export const selectConcentratedLiquidityManagerPlatforms = createSelector(
  (state: BeefyState) => state.entities.platforms.byType.alm,
  ids => arrayOrStaticEmpty(ids?.filter(id => id !== 'conic'))
);

export const selectVaultPlatformOrUndefined = createCachedSelector(
  selectVaultById,
  (state: BeefyState) => state.entities.platforms.byId,
  (vault, tokensByChainId) => {
    const platformId = vault.platformId;

    if (!platformId) {
      return undefined;
    }

    const platform = tokensByChainId[platformId];
    return platform || undefined;
  }
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);
