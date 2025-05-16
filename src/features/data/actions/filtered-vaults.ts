import { orderBy, sortBy } from 'lodash-es';
import { simplifySearchText } from '../../../helpers/string.ts';
import {
  isCowcentratedLikeVault,
  isGovVault,
  isVaultEarningPoints,
  isVaultPaused,
  isVaultRetired,
  shouldVaultShowInterest,
  type VaultEntity,
} from '../entities/vault.ts';
import type { TotalApy } from '../reducers/apy-types.ts';
import type { FilteredVaultsState } from '../reducers/filtered-vaults-types.ts';
import { selectVaultAvgApy, selectVaultTotalApy } from '../selectors/apy.ts';
import {
  selectHasUserDepositInVault,
  selectUserBalanceOfToken,
  selectUserVaultBalanceInUsdIncludingDisplaced,
  selectUserVaultDepositTokenWalletBalanceInUsd,
} from '../selectors/balance.ts';
import {
  selectIsVaultPrestakedBoost,
  selectVaultsActiveBoostPeriodFinish,
} from '../selectors/boosts.ts';
import { selectActiveChainIds, selectAllChainIds } from '../selectors/chains.ts';
import {
  selectFilterOptions,
  selectFilterPlatformIdsForVault,
  selectIsVaultBlueChip,
  selectIsVaultCorrelated,
  selectIsVaultMeme,
  selectIsVaultStable,
  selectVaultIsBoostedForFilter,
  selectVaultMatchesText,
} from '../selectors/filtered-vaults.ts';
import { selectIsVaultIdSaved } from '../selectors/saved-vaults.ts';
import { selectVaultTvl, selectVaultUnderlyingTvlUsd } from '../selectors/tvl.ts';
import {
  selectAllVisibleVaultIds,
  selectVaultById,
  selectVaultIsPinned,
} from '../selectors/vaults.ts';
import { selectVaultSupportsZap } from '../selectors/zap.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type RecalculateFilteredVaultsParams = {
  dataChanged?: boolean;
  filtersChanged?: boolean;
  sortChanged?: boolean;
};

export type RecalculateFilteredVaultsPayload = {
  filtered: VaultEntity['id'][];
  sorted: VaultEntity['id'][];
};

export const recalculateFilteredVaultsAction = createAppAsyncThunk<
  RecalculateFilteredVaultsPayload,
  RecalculateFilteredVaultsParams
>(
  'filtered-vaults/recalculateFilteredVaults',
  async ({ filtersChanged, sortChanged, dataChanged }, { getState }) => {
    const state = getState();
    const filterOptions = selectFilterOptions(state);

    // Recalculate filtered?
    let filteredVaults: VaultEntity[];
    if (dataChanged || filtersChanged) {
      const allChainIds =
        filterOptions.userCategory === 'deposited' || filterOptions.onlyRetired ?
          selectAllChainIds(state)
        : selectActiveChainIds(state);
      const visibleChains = new Set(
        filterOptions.chainIds.length === 0 ? allChainIds : filterOptions.chainIds
      );
      const searchText = simplifySearchText(filterOptions.searchText);
      const allVaults = selectAllVisibleVaultIds(state).map(id => selectVaultById(state, id));

      /*
           @dev every filter that can be applied without using a selector should come first
           then cheap selectors, then expensive selectors last
          */
      filteredVaults = allVaults.filter(vault => {
        // Chains
        if (!visibleChains.has(vault.chainId)) {
          return false;
        }

        // Strategy Type
        if (filterOptions.strategyType === 'pools' && !isGovVault(vault)) {
          return false;
        }

        // TODO change to !isStandardVault if we get rid of base clm
        if (filterOptions.strategyType === 'vaults' && isGovVault(vault)) {
          return false;
        }

        // Hide non-EOL if onlyRetired is checked
        if (filterOptions.onlyRetired && !isVaultRetired(vault)) {
          return false;
        }

        // Hide non-paused if onlyPaused is checked
        if (filterOptions.onlyPaused && !isVaultPaused(vault)) {
          return false;
        }

        // Hide EOL unless onlyRetired is checked or user category is 'My'
        if (
          !filterOptions.onlyRetired &&
          filterOptions.userCategory !== 'deposited' &&
          isVaultRetired(vault)
        ) {
          return false;
        }

        // Hide not earning points if onlyEarningPoints checked
        if (filterOptions.onlyEarningPoints && !isVaultEarningPoints(vault)) {
          return false;
        }

        // Hide non-zappable if onlyZappable checked
        if (filterOptions.onlyZappable && !selectVaultSupportsZap(state, vault.id)) {
          return false;
        }

        // Hide unselected asset types (if any asset type selected)
        if (filterOptions.assetType.length && !filterOptions.assetType.includes(vault.assetType)) {
          return false;
        }

        // Hide non-boosted if onlyBoosted checked
        if (filterOptions.onlyBoosted && !selectVaultIsBoostedForFilter(state, vault.id)) {
          return false;
        }

        // Vault Category
        if (filterOptions.vaultCategory.length) {
          if (
            filterOptions.vaultCategory.includes('bluechip') &&
            !selectIsVaultBlueChip(state, vault.id)
          ) {
            return false;
          }
          if (
            filterOptions.vaultCategory.includes('stable') &&
            !selectIsVaultStable(state, vault.id)
          ) {
            return false;
          }
          if (
            filterOptions.vaultCategory.includes('correlated') &&
            !selectIsVaultCorrelated(state, vault.id)
          ) {
            return false;
          }
          if (filterOptions.vaultCategory.includes('meme') && !selectIsVaultMeme(state, vault.id)) {
            return false;
          }
        }

        // User category: 'Saved'
        if (filterOptions.userCategory === 'saved' && !selectIsVaultIdSaved(state, vault.id)) {
          return false;
        }

        // User category: 'My Positions'
        if (filterOptions.userCategory === 'deposited') {
          // + onlyUnstakedClm
          if (filterOptions.onlyUnstakedClm) {
            if (
              !isCowcentratedLikeVault(vault) ||
              selectUserBalanceOfToken(state, vault.chainId, vault.depositTokenAddress).isZero()
            ) {
              return false;
            }
          } else if (!selectHasUserDepositInVault(state, vault.id)) {
            return false;
          }
        }

        // Platform
        if (filterOptions.platformIds.length) {
          const vaultPlatforms = selectFilterPlatformIdsForVault(state, vault);
          if (!filterOptions.platformIds.some(platform => vaultPlatforms.includes(platform))) {
            return false;
          }
        }

        // Search
        if (searchText.length > 0 && !selectVaultMatchesText(state, vault, searchText)) {
          return false;
        }

        // Underlying TVL
        if (
          filterOptions.minimumUnderlyingTvl.gt(0) &&
          selectVaultUnderlyingTvlUsd(state, vault.id).lt(filterOptions.minimumUnderlyingTvl)
        ) {
          return false;
        }

        // Default: Show
        return true;
      });
    } else {
      filteredVaults = state.ui.filteredVaults.filteredVaultIds.map(id =>
        selectVaultById(state, id)
      );
    }

    // Recalculate sort?
    let sortedVaultIds = state.ui.filteredVaults.sortedFilteredVaultIds;
    if (dataChanged || filtersChanged || sortChanged) {
      if (filterOptions.sort === 'apy') {
        sortedVaultIds = applyApySort(state, filteredVaults, filterOptions, [
          'boostedTotalApy',
          'totalApy',
          'vaultApr',
        ]);
      } else if (filterOptions.sort === 'daily') {
        sortedVaultIds = applyApySort(state, filteredVaults, filterOptions, [
          'boostedTotalDaily',
          'totalDaily',
          'vaultDaily',
        ]);
      } else if (filterOptions.sort === 'tvl') {
        sortedVaultIds = applyTvlSort(state, filteredVaults, filterOptions);
      } else if (filterOptions.sort === 'safetyScore') {
        sortedVaultIds = applySafetyScoreSort(state, filteredVaults, filterOptions);
      } else if (filterOptions.sort === 'depositValue') {
        sortedVaultIds = applyDepositValueSort(state, filteredVaults, filterOptions);
      } else if (filterOptions.sort === 'walletValue') {
        sortedVaultIds = applyWalletValueSort(state, filteredVaults, filterOptions);
      } else {
        sortedVaultIds = applyDefaultSort(state, filteredVaults, filterOptions);
      }
    }

    return {
      filtered: filteredVaults.map(v => v.id),
      sorted: sortedVaultIds,
    };
  },
  {
    condition: ({ filtersChanged, sortChanged, dataChanged }) => {
      // only run if there was a change
      return dataChanged || filtersChanged || sortChanged;
    },
  }
);

function applyDefaultSort(
  state: BeefyState,
  vaults: VaultEntity[],
  filters: FilteredVaultsState
): VaultEntity['id'][] {
  const vaultsToPin = new Set<VaultEntity['id']>(
    vaults
      .filter(vault => vault.status === 'active' && selectVaultIsPinned(state, vault.id))
      .map(v => v.id)
  );

  // Surface retired, paused and boosted
  if (filters.userCategory === 'deposited') {
    return sortBy(vaults, vault =>
      vault.status === 'eol' ? -3
      : vault.status === 'paused' ? -2
      : vaultsToPin.has(vault.id) ? -1
      : 1
    ).map(v => v.id);
  }

  // Surface boosted
  return sortBy(vaults, vault =>
    vaultsToPin.has(vault.id) ?
      selectIsVaultPrestakedBoost(state, vault.id) ? -Number.MAX_SAFE_INTEGER
      : -selectVaultsActiveBoostPeriodFinish(state, vault.id).getTime()
    : 1
  ).map(v => v.id);
}

function applyApySort(
  state: BeefyState,
  vaults: VaultEntity[],
  filters: FilteredVaultsState,
  fields: (keyof TotalApy)[]
): VaultEntity['id'][] {
  return orderBy(
    vaults,
    vault => {
      if (!shouldVaultShowInterest(vault)) {
        return 0;
      }

      const apy = selectVaultTotalApy(state, vault.id);
      if (!apy) {
        return -1;
      }

      if (filters.subSort.apy !== 'default') {
        const avgApy = selectVaultAvgApy(state, vault.id);
        const value = avgApy.periods[filters.subSort.apy].value;
        if (value !== undefined) {
          return value || 0;
        }
      }

      for (const field of fields) {
        const value = apy[field];
        if (value !== undefined) {
          return value || 0;
        }
      }

      throw new Error(`No apy field found for ${vault.id} of ${fields.join(', ')}`);
    },
    filters.sortDirection
  ).map(v => v.id);
}

function applyTvlSort(
  state: BeefyState,
  vaults: VaultEntity[],
  filters: FilteredVaultsState
): VaultEntity['id'][] {
  return orderBy(
    vaults,
    vault => {
      const tvl = selectVaultTvl(state, vault.id);
      if (!tvl) {
        return -1;
      }

      return tvl.toNumber();
    },
    filters.sortDirection
  ).map(v => v.id);
}

function applySafetyScoreSort(
  _state: BeefyState,
  vaults: VaultEntity[],
  filters: FilteredVaultsState
): VaultEntity['id'][] {
  return orderBy(vaults, vault => vault.safetyScore, filters.sortDirection).map(v => v.id);
}

function applyDepositValueSort(
  state: BeefyState,
  vaults: VaultEntity[],
  filters: FilteredVaultsState
): VaultEntity['id'][] {
  return orderBy(
    vaults,
    vault => {
      const value = selectUserVaultBalanceInUsdIncludingDisplaced(state, vault.id);
      if (!value) {
        return -1;
      }

      return value.toNumber();
    },
    filters.sortDirection
  ).map(v => v.id);
}

function applyWalletValueSort(
  state: BeefyState,
  vaults: VaultEntity[],
  filters: FilteredVaultsState
): VaultEntity['id'][] {
  return orderBy(
    vaults,
    vault => {
      const value = selectUserVaultDepositTokenWalletBalanceInUsd(state, vault.id);
      if (!value) {
        return -1;
      }

      return value.toNumber();
    },
    filters.sortDirection
  ).map(v => v.id);
}
