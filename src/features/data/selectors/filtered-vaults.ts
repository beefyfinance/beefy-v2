import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { isGovVault } from '../entities/vault';
import { selectVaultById } from './vaults';

export const selectFilteredVaultIds = createSelector(
  (state: BeefyState) => state.ui.filteredVaults,
  (state: BeefyState) => state.entities.vaults.allIds.map(id => selectVaultById(state, id)),
  (filterOptions, vaults) => {
    // apply filtering
    const chainIdMap = createIdMap(filterOptions.chainIds);
    if (filterOptions.chainIds.length > 0) {
      vaults = vaults.filter(vault => chainIdMap[vault.chainId]);
    }

    const platformIdMap = createIdMap(filterOptions.platformIds);
    if (filterOptions.platformIds.length > 0) {
      vaults = vaults.filter(vault => (isGovVault(vault) ? true : platformIdMap[vault.platformId]));
    }

    // apply sort

    return vaults;
  }
);

function createIdMap(ids: string[]) {
  const map = {};
  for (const id of ids) {
    map[id] = true;
  }
  return map;
}
