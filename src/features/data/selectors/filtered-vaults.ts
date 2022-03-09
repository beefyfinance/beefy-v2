import { createSelector } from '@reduxjs/toolkit';
import { sortBy } from 'lodash';
import { BeefyState } from '../../../redux-types';
import { isGovVault, isVaultRetired } from '../entities/vault';
import {
  selectHasUserDepositInVault,
  selectIsUserEligibleForVault,
  selectUserVaultDepositInUsd,
} from './balance';
import { selectActiveVaultBoostIds, selectBoostById, selectIsVaultBoosted } from './boosts';
import { selectIsVaultLacucina, selectIsVaultMoonpot } from './partners';
import {
  selectIsVaultBeefy,
  selectIsVaultBlueChip,
  selectIsVaultFeatured,
  selectIsVaultStable,
  selectVaultById,
} from './vaults';

export const selectFilterOptions = (state: BeefyState) => state.ui.filteredVaults;

export const selectFilterPopinFilterCount = createSelector(
  selectFilterOptions,
  filterOptions =>
    (filterOptions.onlyRetired ? 1 : 0) +
    (filterOptions.onlyMoonpot ? 1 : 0) +
    (filterOptions.onlyBoosted ? 1 : 0) +
    (filterOptions.onlyLaCucina ? 1 : 0) +
    (filterOptions.platformId !== null ? 1 : 0) +
    (filterOptions.vaultType !== 'all' ? 1 : 0) +
    filterOptions.chainIds.length
);

export const selectHasActiveFilter = createSelector(
  selectFilterOptions,
  filterOptions =>
    filterOptions.vaultCategory !== 'all' ||
    filterOptions.userCategory !== 'all' ||
    filterOptions.vaultType !== 'all' ||
    filterOptions.userCategory !== 'all' ||
    filterOptions.onlyRetired !== false ||
    filterOptions.onlyMoonpot !== false ||
    filterOptions.onlyLaCucina !== false ||
    filterOptions.onlyBoosted !== false ||
    filterOptions.searchText !== '' ||
    filterOptions.platformId !== null ||
    filterOptions.sort !== 'default' ||
    filterOptions.chainIds.length > 0
);

export const selectVaultCategory = createSelector(
  selectFilterOptions,
  filterOptions => filterOptions.vaultCategory
);

// todo: use createSelector or put the result in the state to avoid re-computing these on every render
// https://dev.to/nioufe/you-should-not-use-lodash-for-memoization-3441
export const selectFilteredVaults = (state: BeefyState) => {
  const filterOptions = selectFilterOptions(state);
  const vaults = state.entities.vaults.allIds.map(id => selectVaultById(state, id));
  const tvlByVaultId = state.biz.tvl.byVaultId;
  const apyByVaultId = state.biz.apy.totalApy.byVaultId;

  // apply filtering
  const chainIdMap = createIdMap(filterOptions.chainIds);
  const filteredVaults = vaults.filter(vault => {
    if (filterOptions.vaultCategory === 'featured' && !selectIsVaultFeatured(state, vault.id)) {
      return false;
    }
    if (filterOptions.vaultCategory === 'bluechip' && !selectIsVaultBlueChip(state, vault.id)) {
      return false;
    }
    if (filterOptions.vaultCategory === 'stable' && !selectIsVaultStable(state, vault.id)) {
      return false;
    }
    if (filterOptions.vaultCategory === 'beefy' && !selectIsVaultBeefy(state, vault.id)) {
      return false;
    }

    if (filterOptions.chainIds.length > 0 && !chainIdMap[vault.chainId]) {
      return false;
    }
    if (filterOptions.platformId !== null && vault.platformId !== filterOptions.platformId) {
      return false;
    }
    // paused vaults are not considered retired
    if (filterOptions.onlyRetired && !isVaultRetired(vault)) {
      return false;
    }
    if (!filterOptions.onlyRetired && isVaultRetired(vault)) {
      return false;
    }
    if (filterOptions.onlyMoonpot && !selectIsVaultMoonpot(state, vault.id)) {
      return false;
    }
    if (filterOptions.onlyLaCucina && !selectIsVaultLacucina(state, vault.id)) {
      return false;
    }
    if (filterOptions.onlyBoosted && !selectIsVaultBoosted(state, vault.id)) {
      return false;
    }

    if (filterOptions.vaultType === 'lps' && vault.type !== 'lps') {
      return false;
    }
    if (filterOptions.vaultType === 'single' && vault.type !== 'single') {
      return false;
    }

    // hide when no wallet balance of deposit token
    if (
      filterOptions.userCategory === 'eligible' &&
      !selectIsUserEligibleForVault(state, vault.id)
    ) {
      return false;
    }

    if (
      filterOptions.userCategory === 'deposited' &&
      !selectHasUserDepositInVault(state, vault.id)
    ) {
      return false;
    }

    // If the user's included a search string...
    const searchText = filterOptions.searchText.toLowerCase().replace(/-/g, ' ');
    if (
      searchText.length > 0 &&
      !vault.name.toLowerCase().replace(/-/g, ' ').includes(searchText)
    ) {
      //if the search string is only one character, it's not enough, so hide the vault
      if (searchText.length < 2) return false;

      //for each "token" in the search string...
      const assets = searchText.split(' ');
      for (const asset of assets) {
        //if we're at the beginning or ending hyphen or space, loop for the next word
        if (!asset.length) continue;

        //if the "token" is only one character, it's not enough, so hide the vault
        if (asset.length < 2) return false;

        //If the "token" is not found among the vault's tokens or those of an involved,
        //  active boost, hide the vault. "Fuzzily" account also along the way for the
        //  standardly named wrapped version of a token.
        const Regex = new RegExp(`^w?${asset}$`);
        if (
          !(
            vault.assetIds.find(SearchToken => SearchToken.toLowerCase().match(Regex)) ||
            (isGovVault(vault) && vault.earnedTokenId.toLowerCase().match(Regex)) ||
            (selectIsVaultBoosted(state, vault.id) &&
              selectActiveVaultBoostIds(state, vault.id)
                .map(boostId => selectBoostById(state, boostId))
                .some(boost => boost.earnedTokenId.toLowerCase().match(Regex)))
          )
        )
          return false;
      } //for (const Asset of Assets)
    } //if (SearchText.length > 0 && !vault.name.toLowerCase().includes(SearchText))

    return true;
  });

  // apply sort
  let sortedVaults = filteredVaults;
  if (filterOptions.sort === 'apy') {
    sortedVaults = sortBy(sortedVaults, vault => {
      const apy = apyByVaultId[vault.id];
      if (!apy) {
        return 0;
      }
      if (apy.totalApy !== undefined) {
        return -apy.totalApy;
      } else if (apy.vaultApr !== undefined) {
        return -apy.vaultApr;
      } else {
        throw new Error('Apy type not supported');
      }
    });
  } else if (filterOptions.sort === 'tvl') {
    sortedVaults = sortBy(sortedVaults, vault => {
      const tvl = tvlByVaultId[vault.id];
      if (!tvl) {
        return 0;
      }
      return -tvl.tvl.toNumber();
    });
  } else if (filterOptions.sort === 'safetyScore') {
    sortedVaults = sortBy(sortedVaults, vault => {
      return -vault.safetyScore;
    });
  } else if (filterOptions.sort === 'depositValue') {
    sortedVaults = sortBy(sortedVaults, vault => {
      const balance = selectUserVaultDepositInUsd(state, vault.id);
      return -balance;
    });
  }

  return sortedVaults;
};

export const selectFilteredVaultCount = createSelector(selectFilteredVaults, ids => ids.length);

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
