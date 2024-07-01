import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import { isGovVault } from '../entities/vault';
import { selectDashboardDepositedVaultIdsForAddress } from './balance';
import {
  selectBoostById,
  selectIsVaultPreStakedOrBoosted,
  selectPreStakeOrActiveBoostIds,
} from './boosts';
import { selectVaultById } from './vaults';
import { selectTokenByAddress } from './tokens';
import { createCachedSelector } from 're-reselect';
import type { KeysOfType } from '../utils/types-utils';
import type { FilteredVaultsState } from '../reducers/filtered-vaults';
import type { PlatformEntity } from '../entities/platform';
import { simplifySearchText, stringFoundAnywhere } from '../../../helpers/string';
import escapeStringRegexp from 'escape-string-regexp';
import type BigNumber from 'bignumber.js';

export const selectFilterOptions = (state: BeefyState) => state.ui.filteredVaults;
export const selectFilterSearchText = (state: BeefyState) => state.ui.filteredVaults.searchText;
export const selectFilterChainIds = (state: BeefyState) => state.ui.filteredVaults.chainIds;
export const selectFilterSearchSortField = (state: BeefyState) => state.ui.filteredVaults.sort;
export const selectFilterSearchSortDirection = (state: BeefyState) =>
  state.ui.filteredVaults.sortDirection;
export const selectFilterUserCategory = (state: BeefyState) => state.ui.filteredVaults.userCategory;
export const selectFilterAssetType = (state: BeefyState) => state.ui.filteredVaults.assetType;
export const selectFilterStrategyType = (state: BeefyState) => state.ui.filteredVaults.strategyType;
export const selectFilterVaultCategory = (state: BeefyState) =>
  state.ui.filteredVaults.vaultCategory;
export const selectFilterPlatformIds = (state: BeefyState) => state.ui.filteredVaults.platformIds;

export const selectFilterBoolean = createCachedSelector(
  (state: BeefyState, key: KeysOfType<FilteredVaultsState, boolean>) => key,
  (state: BeefyState) => state.ui.filteredVaults,
  (key, filters) => filters[key]
)((state: BeefyState, key: KeysOfType<FilteredVaultsState, boolean>) => key);

export const selectFilterBigNumber = createCachedSelector(
  (state: BeefyState, key: KeysOfType<FilteredVaultsState, BigNumber>) => key,
  (state: BeefyState) => state.ui.filteredVaults,
  (key, filters) => filters[key]
)((state: BeefyState, key: KeysOfType<FilteredVaultsState, BigNumber>) => key);

export const selectFilterPopinFilterCount = createSelector(
  selectFilterOptions,
  filterOptions =>
    (filterOptions.onlyRetired ? 1 : 0) +
    (filterOptions.onlyPaused ? 1 : 0) +
    (filterOptions.onlyBoosted ? 1 : 0) +
    (filterOptions.onlyZappable ? 1 : 0) +
    (filterOptions.onlyEarningPoints ? 1 : 0) +
    filterOptions.assetType.length +
    filterOptions.vaultCategory.length +
    (filterOptions.strategyType !== 'all' ? 1 : 0) +
    (filterOptions.sort !== 'default' ? 1 : 0) +
    filterOptions.chainIds.length +
    filterOptions.platformIds.length +
    (filterOptions.minimumUnderlyingTvl.gt(0) ? 1 : 0)
);

export const selectHasActiveFilter = createSelector(
  selectFilterOptions,
  filterOptions =>
    filterOptions.vaultCategory.length > 0 ||
    filterOptions.userCategory !== 'all' ||
    filterOptions.assetType.length > 0 ||
    filterOptions.strategyType !== 'all' ||
    filterOptions.onlyRetired !== false ||
    filterOptions.onlyPaused !== false ||
    filterOptions.onlyBoosted !== false ||
    filterOptions.onlyZappable !== false ||
    filterOptions.onlyEarningPoints !== false ||
    filterOptions.searchText !== '' ||
    filterOptions.platformIds.length > 0 ||
    filterOptions.sort !== 'default' ||
    filterOptions.chainIds.length > 0 ||
    filterOptions.minimumUnderlyingTvl.gt(0)
);

export const selectHasActiveFilterExcludingUserCategoryAndSort = createSelector(
  selectFilterOptions,
  filterOptions =>
    filterOptions.vaultCategory.length > 0 ||
    filterOptions.assetType.length > 0 ||
    filterOptions.strategyType !== 'all' ||
    filterOptions.onlyRetired !== false ||
    filterOptions.onlyPaused !== false ||
    filterOptions.onlyBoosted !== false ||
    filterOptions.onlyZappable !== false ||
    filterOptions.onlyEarningPoints !== false ||
    filterOptions.searchText !== '' ||
    filterOptions.platformIds.length > 0 ||
    filterOptions.chainIds.length > 0 ||
    filterOptions.minimumUnderlyingTvl.gt(0)
);

export const selectVaultCategory = createSelector(
  selectFilterOptions,
  filterOptions => filterOptions.vaultCategory
);

// TOKEN, WTOKEN or TOKENW
function fuzzyTokenRegex(token: string) {
  return new RegExp(`^w?${escapeStringRegexp(token)}w?$`, 'gi');
}

function vaultNameMatches(vault: VaultEntity, searchText: string) {
  return stringFoundAnywhere(simplifySearchText(vault.names.list), searchText);
}

function searchTextToFuzzyTokenMatchers(searchText: string) {
  return searchText
    .split(/[- /,]/g)
    .map(t => t.trim())
    .filter(t => t.length > 1)
    .map(t => fuzzyTokenRegex(t));
}

export function selectVaultMatchesText(state: BeefyState, vault: VaultEntity, searchText: string) {
  // Do not match on single characters
  if (searchText.length < 2) {
    return false;
  }

  // Match if: search text is in vault name
  if (vaultNameMatches(vault, searchText)) {
    return true;
  }

  // Split search text in to possible tokens
  const fuzzySearchTokens = searchTextToFuzzyTokenMatchers(searchText);

  // No token names in search string
  if (fuzzySearchTokens.length === 0) {
    return false;
  }

  // All tokens must match
  return fuzzySearchTokens.every(token => {
    // In vault assets
    if (vault.assetIds.some(assetId => assetId.match(token))) {
      return true;
    }

    // In gov earned token
    if (
      isGovVault(vault) &&
      vault.earnedTokenAddresses
        .map(address => selectTokenByAddress(state, vault.chainId, address))
        .some(earnedToken => earnedToken.id.match(token))
    ) {
      return true;
    }

    // Boosts earned token
    if (selectIsVaultPreStakedOrBoosted(state, vault.id)) {
      const boostAssets = selectPreStakeOrActiveBoostIds(state, vault.id)
        .map(boostId => selectBoostById(state, boostId))
        .map(boost => boost.earnedTokenAddress)
        .map(address => selectTokenByAddress(state, vault.chainId, address))
        .map(token => token.id);

      if (boostAssets.some(assetId => assetId.match(token))) {
        return true;
      }
    }

    // Default: no match
    return false;
  });
}

export const selectUserDashboardFilteredVaults = (
  state: BeefyState,
  text: string,
  walletAddress?: string
) => {
  if (!walletAddress) return [];
  const vaults = selectDashboardDepositedVaultIdsForAddress(state, walletAddress).map(id =>
    selectVaultById(state, id)
  );
  const searchText = simplifySearchText(text);
  const filteredVaults = vaults.filter(vault => {
    if (searchText.length > 0 && !selectVaultMatchesText(state, vault, searchText)) {
      return false;
    }

    return true;
  });
  return filteredVaults;
};

export function selectFilterPlatformIdsForVault(state: BeefyState, vault: VaultEntity): string[] {
  const vaultPlatform = selectPlatformIdForFilter(state, vault.platformId);
  const vaultPlatforms = [vaultPlatform];

  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  if (depositToken.providerId) {
    const depositTokenPlatform = selectPlatformIdForFilter(state, depositToken.providerId);
    if (depositTokenPlatform !== 'other' && depositTokenPlatform != vaultPlatform) {
      vaultPlatforms.push(depositTokenPlatform);
    }
  }

  return vaultPlatforms;
}

const selectPlatformIdForFilter = createCachedSelector(
  (state: BeefyState) => state.entities.platforms.allIds,
  (state: BeefyState, platformId: PlatformEntity['id']) => platformId,
  (allIds, platformId) => (allIds.includes(platformId) ? platformId : 'other')
)((state: BeefyState, platformId: PlatformEntity['id']) => platformId);

export const selectFilteredVaults = (state: BeefyState) =>
  state.ui.filteredVaults.sortedFilteredVaultIds;

export const selectFilteredVaultCount = createSelector(selectFilteredVaults, ids => ids.length);

export const selectTotalVaultCount = createSelector(
  (state: BeefyState) => state.entities.vaults.allIds.length,
  c => c
);
