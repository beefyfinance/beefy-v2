import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import {
  isCowcentratedVault,
  isGovVault,
  isVaultEarningPoints,
  isVaultPaused,
  isVaultRetired,
  shouldVaultShowInterest,
  type VaultEntity,
} from '../entities/vault';
import {
  selectFilterOptions,
  selectFilterPlatformIdsForVault,
  selectVaultMatchesText,
} from '../selectors/filtered-vaults';
import {
  selectAllVaultIds,
  selectIsVaultBlueChip,
  selectIsVaultCorrelated,
  selectIsVaultStable,
  selectVaultById,
} from '../selectors/vaults';
import { selectActiveChainIds, selectAllChainIds } from '../selectors/chains';
import { selectVaultSupportsZap } from '../selectors/zap';
import {
  selectIsVaultPrestakedBoost,
  selectIsVaultPreStakedOrBoosted,
  selectVaultsActiveBoostPeriodFinish,
} from '../selectors/boosts';
import { selectIsVaultIdSaved } from '../selectors/saved-vaults';
import {
  selectHasUserDepositInVault,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
  selectUserVaultDepositTokenWalletBalanceInUsd,
} from '../selectors/balance';
import { simplifySearchText } from '../../../helpers/string';
import type { FilteredVaultsState } from '../reducers/filtered-vaults';
import { orderBy, sortBy } from 'lodash-es';
import type { TotalApy } from '../reducers/apy';
import { selectVaultTotalApy } from '../selectors/apy';
import { selectVaultTvl, selectVaultUnderlyingTvlUsd } from '../selectors/tvl';

export type RecalculateFilteredVaultsParams = {
  dataChanged?: boolean;
  filtersChanged?: boolean;
  sortChanged?: boolean;
};

export type RecalculateFilteredVaultsPayload = {
  filtered: VaultEntity['id'][];
  sorted: VaultEntity['id'][];
};

export const recalculateFilteredVaultsAction = createAsyncThunk<
  RecalculateFilteredVaultsPayload,
  RecalculateFilteredVaultsParams,
  { state: BeefyState }
>(
  'filtered-vaults/recalculateFilteredVaults',
  async ({ filtersChanged, sortChanged, dataChanged }, { getState }) => {
    const state = getState();
    const filterOptions = selectFilterOptions(state);

    // Recalculate filtered?
    let filteredVaults: VaultEntity[];
    if (dataChanged || filtersChanged) {
      const allChainIds =
        filterOptions.userCategory === 'deposited' || filterOptions.onlyRetired
          ? selectAllChainIds(state)
          : selectActiveChainIds(state);
      const visibleChains = new Set(
        filterOptions.chainIds.length === 0 ? allChainIds : filterOptions.chainIds
      );
      const searchText = simplifySearchText(filterOptions.searchText);
      const allVaults = selectAllVaultIds(state).map(id => selectVaultById(state, id));

      const vaultsByCategory =
        filterOptions.vaultCategory.length > 0
          ? allVaults.filter(vault => {
              if (
                filterOptions.vaultCategory.includes('bluechip') &&
                selectIsVaultBlueChip(state, vault.id)
              ) {
                return true;
              }
              if (
                filterOptions.vaultCategory.includes('stable') &&
                selectIsVaultStable(state, vault.id)
              ) {
                return true;
              }
              if (
                filterOptions.vaultCategory.includes('correlated') &&
                selectIsVaultCorrelated(state, vault.id)
              ) {
                return true;
              }

              return false;
            })
          : allVaults;

      const vaultsByAssetType =
        filterOptions.assetType.length > 0
          ? vaultsByCategory.filter(vault => {
              if (
                filterOptions.assetType.includes('lps') &&
                vault.assetType === 'lps' &&
                !isCowcentratedVault(vault)
              ) {
                return true;
              }
              if (filterOptions.assetType.includes('single') && vault.assetType === 'single') {
                return true;
              }

              if (filterOptions.assetType.includes('clm') && isCowcentratedVault(vault)) {
                return true;
              }
              return false;
            })
          : vaultsByCategory;

      filteredVaults = vaultsByAssetType.filter(vault => {
        // Chains
        if (!visibleChains.has(vault.chainId)) {
          return false;
        }

        //Strategy Type
        if (filterOptions.strategyType === 'pools' && !isGovVault(vault)) {
          return false;
        }

        if (filterOptions.strategyType === 'vaults' && isGovVault(vault)) {
          return false;
        }

        // Checkboxes
        if (filterOptions.onlyRetired && !isVaultRetired(vault)) {
          return false;
        }

        if (filterOptions.onlyPaused && !isVaultPaused(vault)) {
          return false;
        }

        if (filterOptions.onlyZappable && !selectVaultSupportsZap(state, vault.id)) {
          return false;
        }

        if (filterOptions.onlyEarningPoints && !isVaultEarningPoints(vault)) {
          return false;
        }

        if (filterOptions.onlyBoosted && !selectIsVaultPreStakedOrBoosted(state, vault.id)) {
          return false;
        }

        if (
          filterOptions.minimumTotalSupply.gt(0) &&
          selectVaultUnderlyingTvlUsd(state, vault.id).lt(filterOptions.minimumTotalSupply)
        ) {
          return false;
        }

        // User category: All / Saved Vaults / My Vaults
        if (filterOptions.userCategory === 'saved' && !selectIsVaultIdSaved(state, vault.id)) {
          return false;
        }

        if (
          filterOptions.userCategory === 'deposited' &&
          !selectHasUserDepositInVault(state, vault.id)
        ) {
          return false;
        }

        if (
          !filterOptions.onlyRetired &&
          filterOptions.userCategory !== 'deposited' &&
          isVaultRetired(vault)
        ) {
          // Hide all eol vaults that user is not deposited in if on 'my vaults' tab and only retired is not checked
          return false;
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
  const vaultIsActiveAndBoosted = new Set<VaultEntity['id']>(
    vaults
      .filter(
        vault => vault.status === 'active' && selectIsVaultPreStakedOrBoosted(state, vault.id)
      )
      .map(v => v.id)
  );

  // Surface retired, paused and boosted
  if (filters.userCategory === 'deposited') {
    return sortBy(vaults, vault =>
      vault.status === 'eol'
        ? -3
        : vault.status === 'paused'
        ? -2
        : vaultIsActiveAndBoosted.has(vault.id)
        ? -1
        : 1
    ).map(v => v.id);
  }

  // Surface boosted
  return sortBy(vaults, vault =>
    vaultIsActiveAndBoosted.has(vault.id)
      ? selectIsVaultPrestakedBoost(state, vault.id)
        ? -Number.MAX_SAFE_INTEGER
        : -selectVaultsActiveBoostPeriodFinish(state, vault.id)
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
  state: BeefyState,
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
      const value = selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vault.id);
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
