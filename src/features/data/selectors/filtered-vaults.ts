import { createSelector } from '@reduxjs/toolkit';
import { isEqual } from 'lodash-es';
import type BigNumber from 'bignumber.js';
import escapeStringRegexp from 'escape-string-regexp';
import { createCachedSelector } from 're-reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import {
  safeSearchRegex,
  simplifySearchText,
  stringFoundAnywhere,
} from '../../../helpers/string.ts';
import type { PlatformEntity } from '../entities/platform.ts';
import type { TokenEntity } from '../entities/token.ts';
import { type VaultEntity } from '../entities/vault.ts';
import {
  type EffectiveSortType,
  type FilterValues,
  isRelevanceSortActive,
  type SortWithSubSort,
} from '../reducers/filtered-vaults-types.ts';
import type { BeefyState } from '../store/types.ts';
import { serializeFilterState } from '../utils/filter-url.ts';
import { filterValuesEqual } from '../utils/filter-values.ts';
import type { KeysOfType } from '../utils/types-utils.ts';
import { selectVaultTotalApy } from './apy.ts';
import { selectUserDepositedVaultIds } from './balance.ts';
import { selectActivePromoForVault } from './promos.ts';
import {
  isTokenBluechip,
  isTokenMeme,
  isTokenStable,
  isTokenStock,
  selectTokenByAddressOrUndefined,
  selectVaultTokenSymbols,
} from './tokens.ts';
import { computeUnderlyingTvlUsd } from './tvl.ts';
import { selectAllActiveVaultIds, selectAllVisibleVaultIds, selectVaultById } from './vaults.ts';

export const selectFilterValues = (state: BeefyState) => state.ui.filteredVaults.pending;
export const selectFilterSearchText = (state: BeefyState) =>
  state.ui.filteredVaults.pending.searchText;
export const selectFilterAppliedValues = (state: BeefyState) => state.ui.filteredVaults.applied;
export const selectFilterAppliedSearchText = (state: BeefyState) =>
  state.ui.filteredVaults.applied.searchText;
export const selectFilterAppliedUserCategory = (state: BeefyState) =>
  state.ui.filteredVaults.applied.userCategory;
export const selectFilterAppliedAvgApySort = (state: BeefyState) =>
  state.ui.filteredVaults.applied.subSort.apy;

export const selectFilterSortPickedDuringSearch = (state: BeefyState) =>
  state.ui.filteredVaults.sortPickedDuringSearch;

// url reflects the pending (editable) filters, like the rest of the filter ui
export const selectFilterUrlSearch = createSelector(
  selectFilterValues,
  selectFilterSortPickedDuringSearch,
  serializeFilterState
);

/** false until the recalc for the latest pending change commits it to applied (results reflect pending) */
export const selectFiltersSettled = createSelector(
  selectFilterValues,
  selectFilterAppliedValues,
  filterValuesEqual
);
export const selectFilterChainIds = (state: BeefyState) => state.ui.filteredVaults.pending.chainIds;
export const selectFilterSort = (state: BeefyState) => state.ui.filteredVaults.pending.sort;
export const selectFilterEffectiveSort = (state: BeefyState): EffectiveSortType => {
  const fv = state.ui.filteredVaults;
  // relevance ranking follows the settled (applied) result set; searchRanked keeps the label
  // honest, so all-tied results still order by the selected sort
  return (
      isRelevanceSortActive({
        searchText: fv.applied.searchText,
        sortPickedDuringSearch: fv.sortPickedDuringSearch,
      }) && fv.searchRanked
    ) ?
      'relevance'
    : fv.pending.sort;
};
export const selectFilterSortDirection = (state: BeefyState) =>
  state.ui.filteredVaults.pending.sortDirection;
export const selectFilterUserCategory = (state: BeefyState) =>
  state.ui.filteredVaults.pending.userCategory;
export const selectFilterAssetType = (state: BeefyState) =>
  state.ui.filteredVaults.pending.assetType;
export const selectFilterStrategyType = (state: BeefyState) =>
  state.ui.filteredVaults.pending.strategyType;
export const selectFilterVaultCategory = (state: BeefyState) =>
  state.ui.filteredVaults.pending.vaultCategory;
export const selectFilterPlatformIds = (state: BeefyState) =>
  state.ui.filteredVaults.pending.platformIds;
export const selectFilterAvgApySort = (state: BeefyState) =>
  state.ui.filteredVaults.pending.subSort.apy;

export const selectFilterSubSort = <T extends SortWithSubSort>(state: BeefyState, key: T) =>
  state.ui.filteredVaults.pending.subSort[key];

export const selectFilterBoolean = createCachedSelector(
  (_state: BeefyState, key: KeysOfType<FilterValues, boolean>) => key,
  selectFilterValues,
  (key, filters) => filters[key]
)((_state: BeefyState, key: KeysOfType<FilterValues, boolean>) => key);

export const selectFilterBigNumber = createCachedSelector(
  (_state: BeefyState, key: KeysOfType<FilterValues, BigNumber>) => key,
  selectFilterValues,
  (key, filters) => filters[key]
)((_state: BeefyState, key: KeysOfType<FilterValues, BigNumber>) => key);

export const selectFilterPopinFilterCount = createSelector(
  selectFilterValues,
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

function hasActiveFilterExcludingUserCategoryAndSort(filterOptions: FilterValues): boolean {
  return (
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
}

export const selectHasActiveFilterExcludingUserCategoryAndSort = createSelector(
  selectFilterValues,
  hasActiveFilterExcludingUserCategoryAndSort
);

export const selectFilterAppliedHasActiveExcludingUserCategoryAndSort = createSelector(
  selectFilterAppliedValues,
  hasActiveFilterExcludingUserCategoryAndSort
);

export const selectHasActiveFilter = createSelector(
  selectHasActiveFilterExcludingUserCategoryAndSort,
  selectFilterValues,
  (activeFilter, filterOptions) =>
    activeFilter || filterOptions.userCategory !== 'all' || filterOptions.sort !== 'default'
);

// TOKEN, WTOKEN or TOKENW
function fuzzyTokenRegex(token: string) {
  return new RegExp(`^w?${escapeStringRegexp(token)}w?$`, 'gi');
}

function vaultNameMatches(vault: VaultEntity, searchText: string) {
  // phrase match
  if (stringFoundAnywhere(simplifySearchText(vault.names.list), searchText)) {
    return true;
  }

  // word match
  const words = searchText
    .split(/[- /,]/g)
    .map(t => t.trim())
    .filter(t => t.length > 1)
    .map(t => safeSearchRegex(t, true));
  return words.every(word => vault.names.list.match(word));
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

const selectUserDashboardFilteredVaultsUncached = (
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

const selectPlatformIdForFilter = createCachedSelector(
  (state: BeefyState) => state.entities.platforms.allIds,
  (_state: BeefyState, platformId: PlatformEntity['id']) => platformId,
  (allIds, platformId) => (allIds.includes(platformId) ? platformId : 'other')
)((_state: BeefyState, platformId: PlatformEntity['id']) => platformId);

export const selectFilterPlatformIdsForVault = createCachedSelector(
  (state: BeefyState, vault: VaultEntity) => selectPlatformIdForFilter(state, vault.platformId),
  (state: BeefyState, vault: VaultEntity) => {
    const depositToken = selectTokenByAddressOrUndefined(
      state,
      vault.chainId,
      vault.depositTokenAddress
    );
    return depositToken?.providerId ?
        selectPlatformIdForFilter(state, depositToken.providerId)
      : undefined;
  },
  (vaultPlatform, depositTokenPlatform): string[] => {
    const vaultPlatforms = [vaultPlatform];
    if (
      depositTokenPlatform &&
      depositTokenPlatform !== 'other' &&
      depositTokenPlatform !== vaultPlatform
    ) {
      vaultPlatforms.push(depositTokenPlatform);
    }
    return vaultPlatforms;
  }
)((_state: BeefyState, vault: VaultEntity) => vault.id);

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
  selectFilterValues,
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

export const selectFilterContent = (state: BeefyState) => state.ui.filteredVaults.filterContent;
// category membership is derived from static token tags; keyed by vaultId so it caches per vault
// (the old createSelector(fn, res => res) did the whole compute in the always-run input selector,
// so nothing was ever memoized). Inputs are the vault and the token slice, both stable after load.
type TokensByChainId = BeefyState['entities']['tokens']['byChainId'];
const selectTokensByChainId = (state: BeefyState): TokensByChainId =>
  state.entities.tokens.byChainId;

/** resolve a vault asset id to its token, mirroring selectTokenByIdOrUndefined without a state read */
function resolveAssetToken(
  byChainId: TokensByChainId,
  chainId: VaultEntity['chainId'],
  tokenId: string
): TokenEntity | undefined {
  const address = byChainId[chainId]?.byId[tokenId];
  return address ? byChainId[chainId]?.byAddress[address] : undefined;
}

/** true when the vault asset resolves to a token satisfying `isTag` (missing token => false) */
function vaultAssetHasTag(
  byChainId: TokensByChainId,
  vault: VaultEntity,
  tokenId: string,
  isTag: (token: TokenEntity) => boolean
): boolean {
  const token = resolveAssetToken(byChainId, vault.chainId, tokenId);
  return !!token && isTag(token);
}

export const selectIsVaultBlueChip = createCachedSelector(
  selectVaultById,
  selectTokensByChainId,
  (vault, byChainId) => {
    const nonStables = vault.assetIds.filter(
      tokenId => !vaultAssetHasTag(byChainId, vault, tokenId, isTokenStable)
    );
    return (
      nonStables.length > 0 &&
      nonStables.every(tokenId => vaultAssetHasTag(byChainId, vault, tokenId, isTokenBluechip))
    );
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultStable = createCachedSelector(
  selectVaultById,
  selectTokensByChainId,
  (vault, byChainId) =>
    vault.assetIds.every(assetId => vaultAssetHasTag(byChainId, vault, assetId, isTokenStable))
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultCorrelated = createCachedSelector(
  selectVaultById,
  selectTokensByChainId,
  (vault, byChainId) =>
    !vault.risks.notCorrelated &&
    vault.assetIds.length > 1 &&
    // "not stable" inlined (was selectIsVaultStable) so this stays a single cached compute
    !vault.assetIds.every(assetId => vaultAssetHasTag(byChainId, vault, assetId, isTokenStable))
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultMeme = createCachedSelector(
  selectVaultById,
  selectTokensByChainId,
  (vault, byChainId) =>
    vault.assetIds.some(assetId => vaultAssetHasTag(byChainId, vault, assetId, isTokenMeme))
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultStock = createCachedSelector(
  selectVaultById,
  selectTokensByChainId,
  (vault, byChainId) =>
    vault.assetIds.some(assetId => vaultAssetHasTag(byChainId, vault, assetId, isTokenStock))
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

// memoized on the active-id list + vault and breakdown slices so the full scan reruns only when
// those change, not on every dispatch while the min-TVL filter dropdown is open
export const selectMaximumUnderlyingVaultTvl = createSelector(
  selectAllActiveVaultIds,
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState) => state.entities.tokens.breakdown.byOracleId,
  (activeIds, vaultsById, breakdownByOracleId) => {
    let maxTvl = BIG_ZERO;
    for (const id of activeIds) {
      const vault = vaultsById[id];
      if (!vault) {
        continue;
      }
      const underlyingTvl = computeUnderlyingTvlUsd(vault, breakdownByOracleId[vault.breakdownId]);
      if (underlyingTvl.gt(maxTvl)) {
        maxTvl = underlyingTvl;
      }
    }
    return maxTvl;
  }
);

// allocates a new array every call, which also breaks the sort useMemo downstream
export const selectUserDashboardFilteredVaults = createCachedSelector(
  (state: BeefyState) => state,
  (_state: BeefyState, text: string) => text,
  (_state: BeefyState, _text: string, walletAddress?: string) => walletAddress,
  (state: BeefyState, text: string, walletAddress?: string) =>
    selectUserDashboardFilteredVaultsUncached(state, text, walletAddress),
  { memoizeOptions: { resultEqualityCheck: isEqual } }
)((_state: BeefyState, text: string, walletAddress?: string) => `${walletAddress ?? ''}-${text}`);
