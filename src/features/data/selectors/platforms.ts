import { createSelector } from '@reduxjs/toolkit';
import type { PlatformEntity } from '../entities/platform.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { selectVaultById } from './vaults.ts';
import { isDefined } from '../utils/array-utils.ts';

export const selectPlatformById = (state: BeefyState, platformId: PlatformEntity['id']) => {
  const platform = state.entities.platforms.byId[platformId];
  if (platform === undefined) {
    throw new Error(`selectPlatformById: Unknown platform id ${platformId}`);
  }
  return platform;
};

export const selectPlatformByIdOrUndefined = (
  state: BeefyState,
  platformId: PlatformEntity['id']
) => state.entities.platforms.byId[platformId];

/** All platforms actually used by a vault that loaded */
export const selectUsedPlatforms = createSelector(
  (state: BeefyState) => state.entities.platforms.usedIds,
  (state: BeefyState) => state.entities.platforms.byId,
  (usedIds, byId) => usedIds.map(id => byId[id]).filter(isDefined)
);

export const selectKnownPlatformIds = createSelector(
  (state: BeefyState) => state.entities.platforms.allIds,
  (allIds): ReadonlySet<PlatformEntity['id']> => new Set(allIds)
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

export const selectVaultPlatformOrUndefined = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const platformId = selectVaultById(state, vaultId).platformId;
  return platformId ? state.entities.platforms.byId[platformId] : undefined;
};
