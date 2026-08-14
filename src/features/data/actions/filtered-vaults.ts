import { orderBy, sortBy } from 'lodash-es';
import {
  getCowcentratedWrapperIds,
  isCowcentratedVault,
  shouldVaultShowInterest,
  type VaultEntity,
} from '../entities/vault.ts';
import type { TotalApy } from '../reducers/apy-types.ts';
import { type FilterValues, isRelevanceSortActive } from '../reducers/filtered-vaults-types.ts';
import {
  selectClmDisplayVaultId,
  selectVaultAvgApy,
  selectVaultTotalApy,
} from '../selectors/apy.ts';
import {
  selectUserClmGroupBalanceInUsd,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from '../selectors/balance.ts';
import {
  selectIsVaultPrestakedBoost,
  selectVaultsActiveBoostPeriodFinish,
} from '../selectors/boosts.ts';
import { selectFilterValues } from '../selectors/filtered-vaults.ts';
import { selectVaultRawTvl, selectVaultTvl } from '../selectors/tvl.ts';
import {
  selectAllListVaultIds,
  selectVaultById,
  selectVaultIsPinned,
} from '../selectors/vaults.ts';
import type { BeefyState } from '../store/types.ts';
import { filtersDependOnData } from '../utils/filter-values.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { buildVaultFilterEnv, vaultPassesFilters } from '../utils/vault-filter.ts';
import { hasSearchText } from '../utils/vault-search.ts';

export type RecalculateFilteredVaultsParams = {
  dataChanged?: boolean;
  filtersChanged?: boolean;
  sortChanged?: boolean;
};

export type RecalculateFilteredVaultsPayload = {
  filtered: VaultEntity['id'][];
  sorted: VaultEntity['id'][];
  /** the pending filter snapshot this recalc ran against; committed to `applied` on fulfilled */
  applied: FilterValues;
  /** true when the sorted ids are relevance-ranked (search active and scores discriminate) */
  searchRanked: boolean;
};

export const recalculateFilteredVaultsAction = createAppAsyncThunk<
  RecalculateFilteredVaultsPayload,
  RecalculateFilteredVaultsParams
>(
  'filtered-vaults/recalculateFilteredVaults',
  async ({ filtersChanged, sortChanged, dataChanged }, { getState }) => {
    const state = getState();
    const filterOptions = selectFilterValues(state); // pending

    // Recalculate filtered? Can't skip search due to relevance ranking.
    const searchActive = hasSearchText(filterOptions.searchText);
    const mustRefilter =
      !!filtersChanged || (!!dataChanged && (searchActive || filtersDependOnData(filterOptions)));

    const searchScores = new Map<VaultEntity['id'], number>();
    let filteredVaults: VaultEntity[];
    if (mustRefilter) {
      const allVaults = selectAllListVaultIds(state).map(id => selectVaultById(state, id));
      const env = buildVaultFilterEnv(state, filterOptions, searchScores);
      filteredVaults = allVaults.filter(vault =>
        vaultPassesFilters(state, vault, filterOptions, env)
      );
    } else {
      filteredVaults = state.ui.filteredVaults.filteredVaultIds.map(id =>
        selectVaultById(state, id)
      );
    }

    // Recalculate sort?
    let sortedVaultIds = state.ui.filteredVaults.sortedFilteredVaultIds;
    // relevance only ranks when it discriminates; all-tied results keep the selected sort.
    // score over the FINAL set: the search check runs before minUnderlyingTvl, so the map also
    // holds excluded vaults whose scores must not decide ranking
    const searchRanked =
      mustRefilter &&
      isRelevanceSortActive({
        searchText: filterOptions.searchText,
        sortPickedDuringSearch: state.ui.filteredVaults.sortPickedDuringSearch,
      }) &&
      hasDiscriminatingScores(filteredVaults, searchScores);
    if (dataChanged || filtersChanged || sortChanged) {
      if (searchRanked) {
        // scores always fresh: sort-only dispatches imply a picked sort, which disables relevance
        sortedVaultIds = applyRelevanceSort(state, filteredVaults, searchScores);
      } else {
        sortedVaultIds = applySelectedSort(state, filteredVaults, filterOptions);
      }
    }

    return {
      filtered: filteredVaults.map(v => v.id),
      sorted: sortedVaultIds,
      applied: filterOptions,
      searchRanked,
    };
  }
);

function applySelectedSort(
  state: BeefyState,
  vaults: VaultEntity[],
  filterOptions: FilterValues
): VaultEntity['id'][] {
  switch (filterOptions.sort) {
    case 'apy':
      return applyApySort(state, vaults, filterOptions, [
        'boostedTotalApy',
        'totalApy',
        'vaultApr',
      ]);
    case 'daily':
      return applyApySort(state, vaults, filterOptions, [
        'boostedTotalDaily',
        'totalDaily',
        'vaultDaily',
      ]);
    case 'tvl':
      return applyTvlSort(state, vaults, filterOptions);
    case 'depositValue':
      return applyDepositValueSort(state, vaults, filterOptions);
    default:
      return applyDefaultSort(state, vaults, filterOptions);
  }
}

function hasDiscriminatingScores(
  vaults: VaultEntity[],
  scores: ReadonlyMap<VaultEntity['id'], number>
): boolean {
  let first: number | undefined;
  for (const vault of vaults) {
    const score = scores.get(vault.id) ?? 0;
    first ??= score;
    if (score !== first) {
      return true;
    }
  }
  return false;
}

/** raw = before exclusions, i.e. the whole CLM group for a merged row */
function rowTvl(state: BeefyState, vault: VaultEntity): number {
  const tvl =
    isCowcentratedVault(vault) ?
      selectVaultRawTvl(state, vault.id)
    : selectVaultTvl(state, vault.id);
  return tvl ? tvl.toNumber() : -1;
}

function applyRelevanceSort(
  state: BeefyState,
  vaults: VaultEntity[],
  scores: ReadonlyMap<VaultEntity['id'], number>
): VaultEntity['id'][] {
  return orderBy(
    vaults,
    [vault => scores.get(vault.id) ?? 0, vault => rowTvl(state, vault)],
    ['desc', 'desc']
  ).map(v => v.id);
}

function applyDefaultSort(
  state: BeefyState,
  vaults: VaultEntity[],
  filters: FilterValues
): VaultEntity['id'][] {
  const vaultsToPin = new Set<VaultEntity['id']>(
    vaults
      .filter(
        vault =>
          vault.status === 'active' &&
          (selectVaultIsPinned(state, vault.id) ||
            // a merged CLM row is pinned if any of its pools/vaults are
            (isCowcentratedVault(vault) &&
              getCowcentratedWrapperIds(vault).some(id => selectVaultIsPinned(state, id))))
      )
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
  filters: FilterValues,
  fields: (keyof TotalApy)[]
): VaultEntity['id'][] {
  return orderBy(
    vaults,
    vault => {
      if (!shouldVaultShowInterest(vault)) {
        return 0;
      }

      // merged CLM rows sort by the rate of the side they display
      const apyVaultId = selectClmDisplayVaultId(state, vault.id);
      const apy = selectVaultTotalApy(state, apyVaultId);
      if (!apy) {
        return -1;
      }

      if (filters.subSort.apy !== 'default') {
        const avgApy = selectVaultAvgApy(state, apyVaultId);
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
  filters: FilterValues
): VaultEntity['id'][] {
  return orderBy(vaults, vault => rowTvl(state, vault), filters.sortDirection).map(v => v.id);
}

function applyDepositValueSort(
  state: BeefyState,
  vaults: VaultEntity[],
  filters: FilterValues
): VaultEntity['id'][] {
  return orderBy(
    vaults,
    vault => {
      const value =
        isCowcentratedVault(vault) ?
          selectUserClmGroupBalanceInUsd(state, vault.id)
        : selectUserVaultBalanceInUsdIncludingDisplaced(state, vault.id);
      if (!value) {
        return -1;
      }

      return value.toNumber();
    },
    filters.sortDirection
  ).map(v => v.id);
}
