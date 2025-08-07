import { createSelector } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import escapeStringRegexp from 'escape-string-regexp';
import { differenceWith, isEqual } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { simplifySearchText, stringFoundAnywhere } from '../../../helpers/string.ts';
import type { PlatformEntity } from '../entities/platform.ts';
import { type VaultEntity } from '../entities/vault.ts';
import type { FilteredVaultsState, SortWithSubSort } from '../reducers/filtered-vaults-types.ts';
import type { BeefyState } from '../store/types.ts';
import type { KeysOfType } from '../utils/types-utils.ts';
import { selectVaultTotalApy } from './apy.ts';
import { selectUserDepositedVaultIds } from './balance.ts';
import { selectChainById } from './chains.ts';
import { selectActivePromoForVault } from './promos.ts';
import {
  selectIsTokenBluechip,
  selectIsTokenMeme,
  selectIsTokenStable,
  selectTokenByAddress,
  selectVaultTokenSymbols,
} from './tokens.ts';
import { selectVaultUnderlyingTvlUsd } from './tvl.ts';
import { selectAllActiveVaultIds, selectAllVisibleVaultIds, selectVaultById } from './vaults.ts';

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
export const selectFilterAvgApySort = (state: BeefyState) => state.ui.filteredVaults.subSort.apy;

export const selectFilterSubSort = <T extends SortWithSubSort>(state: BeefyState, key: T) =>
  state.ui.filteredVaults.subSort[key];

export const selectFilterBoolean = createCachedSelector(
  (_state: BeefyState, key: KeysOfType<FilteredVaultsState, boolean>) => key,
  (state: BeefyState) => state.ui.filteredVaults,
  (key, filters) => filters[key]
)((_state: BeefyState, key: KeysOfType<FilteredVaultsState, boolean>) => key);

export const selectFilterBigNumber = createCachedSelector(
  (_state: BeefyState, key: KeysOfType<FilteredVaultsState, BigNumber>) => key,
  (state: BeefyState) => state.ui.filteredVaults,
  (key, filters) => filters[key]
)((_state: BeefyState, key: KeysOfType<FilteredVaultsState, BigNumber>) => key);

export const selectFilterPopinFilterCount = createSelector(
  selectFilterOptions,
  filterOptions =>
    (filterOptions.onlyRetired ? 1 : 0) +
    (filterOptions.onlyPaused ? 1 : 0) +
    (filterOptions.onlyBoosted ? 1 : 0) +
    (filterOptions.onlyZappable ? 1 : 0) +
    (filterOptions.onlyEarningPoints ? 1 : 0) +
    (filterOptions.onlyUnstakedClm ? 1 : 0) +
    filterOptions.assetType.length +
    filterOptions.vaultCategory.length +
    (filterOptions.strategyType !== 'all' ? 1 : 0) +
    filterOptions.chainIds.length +
    filterOptions.platformIds.length +
    (filterOptions.minimumUnderlyingTvl.gt(0) ? 1 : 0)
);

export const selectHasActiveFilterExcludingUserCategoryAndSort = createSelector(
  selectFilterOptions,
  filterOptions =>
    filterOptions.vaultCategory.length > 0 ||
    filterOptions.assetType.length > 0 ||
    filterOptions.strategyType !== 'all' ||
    filterOptions.onlyRetired ||
    filterOptions.onlyPaused ||
    filterOptions.onlyBoosted ||
    filterOptions.onlyZappable ||
    filterOptions.onlyEarningPoints ||
    filterOptions.onlyUnstakedClm ||
    filterOptions.searchText !== '' ||
    filterOptions.platformIds.length > 0 ||
    filterOptions.chainIds.length > 0 ||
    filterOptions.minimumUnderlyingTvl.gt(0)
);

export const selectHasActiveFilter = createSelector(
  selectHasActiveFilterExcludingUserCategoryAndSort,
  selectFilterOptions,
  (activeFilter, filterOptions) =>
    activeFilter || filterOptions.userCategory !== 'all' || filterOptions.sort !== 'default'
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
  // Empty text matches all

  const normalizedSearchText = searchText.toLowerCase();
  if (normalizedSearchText.length === 0) {
    return true;
  }

  // Match if: search text is in vault name
  if (vaultNameMatches(vault, normalizedSearchText)) {
    return true;
  }

  // Split search text in to possible tokens
  const fuzzySearchTokens = searchTextToFuzzyTokenMatchers(normalizedSearchText);

  // No token names in search string
  if (fuzzySearchTokens.length === 0) {
    return false;
  }

  // All tokens must match
  const tokenSymbols = selectVaultTokenSymbols(state, vault.id);

  return fuzzySearchTokens.every(token => {
    // In vault assets
    if (
      tokenSymbols.some(
        symbol => symbol.match(token) || symbol.toLowerCase().includes(normalizedSearchText)
      )
    ) {
      return true;
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
  const vaults = selectUserDepositedVaultIds(state, walletAddress).map(id =>
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
    if (depositTokenPlatform !== 'other' && depositTokenPlatform !== vaultPlatform) {
      vaultPlatforms.push(depositTokenPlatform);
    }
  }

  return vaultPlatforms;
}

const selectPlatformIdForFilter = createCachedSelector(
  (state: BeefyState) => state.entities.platforms.allIds,
  (_state: BeefyState, platformId: PlatformEntity['id']) => platformId,
  (allIds, platformId) => (allIds.includes(platformId) ? platformId : 'other')
)((_state: BeefyState, platformId: PlatformEntity['id']) => platformId);

export const selectFilteredVaults = (state: BeefyState) =>
  state.ui.filteredVaults.sortedFilteredVaultIds;

export const selectFilteredVaultCount = createSelector(selectFilteredVaults, ids => ids.length);

export const selectTotalVaultCount = (state: BeefyState) => selectAllVisibleVaultIds(state).length;

/** standard boost, off chain boost, or anything with boostedTotalDaily entry */
export const selectVaultIsBoostedForFilter = (state: BeefyState, vaultId: VaultEntity['id']) => {
  if (selectActivePromoForVault(state, vaultId)) {
    return true;
  }

  const apy = selectVaultTotalApy(state, vaultId);
  return !!apy && (apy.boostedTotalDaily || 0) > 0;
};

export const selectAnyDesktopExtenderFilterIsActive = createSelector(
  selectFilterOptions,
  filterOptions => {
    if (
      filterOptions.onlyZappable ||
      filterOptions.onlyEarningPoints ||
      filterOptions.onlyRetired ||
      filterOptions.onlyPaused ||
      filterOptions.platformIds.length > 0 ||
      filterOptions.minimumUnderlyingTvl.gt(0)
    ) {
      return true;
    }

    return false;
  }
);

export const selectFilterContent = createSelector(
  selectFilterOptions,
  filterOptions => filterOptions.filterContent
);
export const selectIsVaultBlueChip = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, vault.chainId);
    const nonStables = differenceWith(vault.assetIds, chain.stableCoins, isEqual);
    return (
      nonStables.length > 0 &&
      nonStables.every(tokenId => {
        return selectIsTokenBluechip(state, tokenId);
      })
    );
  },
  res => res
);
export const selectIsVaultStable = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return vault.assetIds.every(assetId => selectIsTokenStable(state, vault.chainId, assetId));
  },
  res => res
);
export const selectIsVaultCorrelated = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);

    return (
      vault.risks.includes('IL_NONE') &&
      vault.assetIds.length > 1 &&
      !selectIsVaultStable(state, vaultId)
    );
  },
  res => res
);

export const selectIsVaultMeme = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return vault.assetIds.some(assetId => selectIsTokenMeme(state, assetId));
  },
  res => res
);

export const selectMaximumUnderlyingVaultTvl = (state: BeefyState) => {
  const ids = selectAllActiveVaultIds(state);
  let maxTvl = BIG_ZERO;
  for (const id of ids) {
    const underlyingTvl = selectVaultUnderlyingTvlUsd(state, id);
    if (underlyingTvl.gt(maxTvl)) {
      maxTvl = underlyingTvl;
    }
  }
  return maxTvl;
};
