import { createSelector } from '@reduxjs/toolkit';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import type { BeefyState } from '../store/types.ts';

export const selectFeaturedVaultIds = createSelector(
  (state: BeefyState) => state.entities.featuredVaults.vaultIds,
  (state: BeefyState) => state.entities.vaults.allActiveIds,
  (featuredIds, allActiveIds) => {
    const activeSet = new Set(allActiveIds);
    return arrayOrStaticEmpty(featuredIds.filter(id => activeSet.has(id)));
  }
);
