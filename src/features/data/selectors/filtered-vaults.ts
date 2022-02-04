import { createSelector } from '@reduxjs/toolkit';
import { sortBy } from 'lodash';
import { BeefyState } from '../../../redux-types';
import { isGovVaultApy, isMaxiVaultApy, isStandardVaultApy } from '../apis/beefy';
import { isGovVault } from '../entities/vault';
import { selectVaultById } from './vaults';

export const selectFilterOptions = (state: BeefyState) => state.ui.filteredVaults;

export const selectFilterPopinFilterCount = createSelector(
  selectFilterOptions,
  filterOptions =>
    (filterOptions.showRetired ? 1 : 0) +
    (filterOptions.onlyMoonpot ? 1 : 0) +
    (filterOptions.onlyBoosted ? 1 : 0) +
    filterOptions.platformIds.length +
    filterOptions.chainIds.length
);

export const selectHasActiveFilter = createSelector(
  selectFilterOptions,
  filterOptions =>
    filterOptions.vaultCategory !== 'all' ||
    filterOptions.userCategory !== 'all' ||
    filterOptions.vaultType !== 'all' ||
    filterOptions.userCategory !== 'all' ||
    filterOptions.showRetired !== false ||
    filterOptions.onlyMoonpot !== false ||
    filterOptions.onlyBoosted !== false ||
    filterOptions.searchText !== '' ||
    filterOptions.platformIds.length > 0 ||
    filterOptions.chainIds.length > 0
);

export const selectVaultCategory = createSelector(
  selectFilterOptions,
  filterOptions => filterOptions.vaultCategory
);

export const selectFilteredVaultIds = createSelector(
  selectFilterOptions,
  (state: BeefyState) => state.entities.vaults.allIds.map(id => selectVaultById(state, id)),
  (state: BeefyState) => state.biz.tvl.byVaultId,
  (state: BeefyState) => state.biz.apy.byVaultId,
  (filterOptions, vaults, tvlByVaultId, apyByVaultId) => {
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
    if (filterOptions.sort === 'apy') {
      vaults = sortBy(vaults, vault => {
        const apy = apyByVaultId[vault.id];
        if (!apy) {
          return 0;
        }
        if (isStandardVaultApy(apy)) {
          return apy.totalApy;
        } else if (isGovVaultApy(apy)) {
          return apy.vaultApr;
        } else if (isMaxiVaultApy(apy)) {
          return apy.totalApy;
        } else {
          throw new Error('Apy type not supported');
        }
      });
    } else if (filterOptions.sort === 'tvl') {
      vaults = sortBy(vaults, vault => {
        const tvl = tvlByVaultId[vault.id];
        return tvl.tvl.toNumber();
      });
    } else if (filterOptions.sort === 'safety') {
      throw new Error('Not implemented');
    }

    return vaults;
  }
);

export const selectFilteredVaultCount = createSelector(selectFilteredVaultIds, ids => ids.length);

export const selectTotalVaultCount = createSelector(
  (state: BeefyState) => state.entities.vaults.allIds.length,
  c => c
);

function createIdMap(ids: string[]) {
  const map = {};
  for (const id of ids) {
    map[id] = true;
  }
  return map;
}
