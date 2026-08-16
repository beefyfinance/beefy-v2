import { orderBy, sortBy } from 'lodash-es';
import {
  isCowcentratedStandardVault,
  isVaultActive,
  shouldVaultShowInterest,
  type VaultEntity,
} from '../entities/vault.ts';
import type { TotalApy } from '../reducers/apy-types.ts';
import { type FilterValues, isRelevanceSortActive } from '../reducers/filtered-vaults-types.ts';
import { selectVaultAvgApy, selectVaultTotalApy } from '../selectors/apy.ts';
import {
  selectUserDepositedVaultIds,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from '../selectors/balance.ts';
import {
  selectIsVaultPrestakedBoost,
  selectVaultsActiveBoostPeriodFinish,
} from '../selectors/boosts.ts';
import { selectFilterValues } from '../selectors/filtered-vaults.ts';
import { selectVaultTvl } from '../selectors/tvl.ts';
import {
  selectAllVisibleVaultIds,
  selectVaultById,
  selectVaultIsPinned,
} from '../selectors/vaults.ts';
import type { BeefyState } from '../store/types.ts';
import { filtersDependOnData } from '../utils/filter-values.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';
import { buildVaultFilterEnv, vaultPassesFilters } from '../utils/vault-filter.ts';
import {
  buildVaultListRows,
  rowFromAnchorId,
  type VaultListRow,
} from '../utils/vault-list-rows.ts';
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
    let rows: VaultListRow[];
    if (mustRefilter) {
      // filters run per member; a row is kept when either member passes
      const allVaults = selectAllVisibleVaultIds(state).map(id => selectVaultById(state, id));
      const env = buildVaultFilterEnv(state, filterOptions, searchScores);
      rows = buildVaultListRows(allVaults, vault =>
        vaultPassesFilters(state, vault, filterOptions, env)
      );
    } else {
      rows = state.ui.filteredVaults.filteredVaultIds.map(id => rowFromAnchorId(state, id));
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
      hasDiscriminatingScores(rows, searchScores);
    if (dataChanged || filtersChanged || sortChanged) {
      if (searchRanked) {
        // scores always fresh: sort-only dispatches imply a picked sort, which disables relevance
        sortedVaultIds = applyRelevanceSort(state, rows, searchScores);
      } else {
        sortedVaultIds = applySelectedSort(state, rows, filterOptions);
      }
    }

    return {
      filtered: rows.map(r => r.id),
      sorted: sortedVaultIds,
      applied: filterOptions,
      searchRanked,
    };
  }
);

function applySelectedSort(
  state: BeefyState,
  rows: VaultListRow[],
  filterOptions: FilterValues
): VaultEntity['id'][] {
  switch (filterOptions.sort) {
    case 'apy':
      return applyApySort(state, rows, filterOptions, ['boostedTotalApy', 'totalApy', 'vaultApr']);
    case 'daily':
      return applyApySort(state, rows, filterOptions, [
        'boostedTotalDaily',
        'totalDaily',
        'vaultDaily',
      ]);
    case 'tvl':
      return applyTvlSort(state, rows, filterOptions);
    case 'depositValue':
      return applyDepositValueSort(state, rows, filterOptions);
    default:
      return applyDefaultSort(state, rows, filterOptions);
  }
}

/** relevance may only rank by members that passed the filters: the score map is populated
 * before the min-underlying-tvl check, so non-passing members can hold scores */
function rowSearchScore(row: VaultListRow, scores: ReadonlyMap<VaultEntity['id'], number>): number {
  let max = 0;
  for (const id of row.passingMemberIds) {
    const score = scores.get(id) ?? 0;
    if (score > max) {
      max = score;
    }
  }
  return max;
}

function hasDiscriminatingScores(
  rows: VaultListRow[],
  scores: ReadonlyMap<VaultEntity['id'], number>
): boolean {
  let first: number | undefined;
  for (const row of rows) {
    const score = rowSearchScore(row, scores);
    first ??= score;
    if (score !== first) {
      return true;
    }
  }
  return false;
}

/** family tvl: the pool's tvl excludes an ACTIVE vault sibling's stake, so summing is exact then;
 * for a non-active sibling the pool figure still contains its stake — max avoids double counting */
function rowTvlSortValue(state: BeefyState, row: VaultListRow): number {
  let sum = 0;
  let max = 0;
  let any = false;
  let sumIsExact = true;
  for (const member of row.members) {
    if (isCowcentratedStandardVault(member) && !isVaultActive(member)) {
      sumIsExact = false;
    }
    const tvl = selectVaultTvl(state, member.id);
    if (!tvl) {
      continue;
    }
    const value = tvl.toNumber();
    any = true;
    sum += value;
    if (value > max) {
      max = value;
    }
  }
  if (!any) {
    return -1;
  }
  return sumIsExact ? sum : max;
}

function applyRelevanceSort(
  state: BeefyState,
  rows: VaultListRow[],
  scores: ReadonlyMap<VaultEntity['id'], number>
): VaultEntity['id'][] {
  return orderBy(
    rows,
    [row => rowSearchScore(row, scores), row => rowTvlSortValue(state, row)],
    ['desc', 'desc']
  ).map(r => r.id);
}

function applyDefaultSort(
  state: BeefyState,
  rows: VaultListRow[],
  filters: FilterValues
): VaultEntity['id'][] {
  const pinnedByRowId = new Map<VaultEntity['id'], VaultEntity[]>();
  for (const row of rows) {
    const pinned = row.members.filter(
      member => member.status === 'active' && selectVaultIsPinned(state, member.id)
    );
    if (pinned.length) {
      pinnedByRowId.set(row.id, pinned);
    }
  }

  // Surface retired, paused and boosted
  if (filters.userCategory === 'deposited') {
    const depositedIds = new Set(selectUserDepositedVaultIds(state));
    return sortBy(rows, row => {
      // rank by the worst status among members the user deposited in, so a family
      // with a dead deposit still surfaces
      const deposited = row.members.filter(member => depositedIds.has(member.id));
      const ranked = deposited.length ? deposited : row.members;
      return Math.min(
        ...ranked.map(member =>
          member.status === 'eol' ? -3
          : member.status === 'paused' ? -2
          : pinnedByRowId.has(row.id) ? -1
          : 1
        )
      );
    }).map(r => r.id);
  }

  // Surface boosted
  return sortBy(rows, row => {
    const pinned = pinnedByRowId.get(row.id);
    if (!pinned) {
      return 1;
    }
    if (pinned.some(member => selectIsVaultPrestakedBoost(state, member.id))) {
      return -Number.MAX_SAFE_INTEGER;
    }
    return -Math.max(
      ...pinned.map(member => selectVaultsActiveBoostPeriodFinish(state, member.id).getTime())
    );
  }).map(r => r.id);
}

function vaultApySortValue(
  state: BeefyState,
  vault: VaultEntity,
  filters: FilterValues,
  fields: (keyof TotalApy)[]
): number {
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
    if (typeof value === 'number') {
      return value || 0;
    }
  }

  throw new Error(`No apy field found for ${vault.id} of ${fields.join(', ')}`);
}

function applyApySort(
  state: BeefyState,
  rows: VaultListRow[],
  filters: FilterValues,
  fields: (keyof TotalApy)[]
): VaultEntity['id'][] {
  return orderBy(
    rows,
    row =>
      Math.max(...row.members.map(member => vaultApySortValue(state, member, filters, fields))),
    filters.sortDirection
  ).map(r => r.id);
}

function applyTvlSort(
  state: BeefyState,
  rows: VaultListRow[],
  filters: FilterValues
): VaultEntity['id'][] {
  return orderBy(rows, row => rowTvlSortValue(state, row), filters.sortDirection).map(r => r.id);
}

function applyDepositValueSort(
  state: BeefyState,
  rows: VaultListRow[],
  filters: FilterValues
): VaultEntity['id'][] {
  return orderBy(
    rows,
    row => {
      let sum: number | undefined;
      for (const member of row.members) {
        const value = selectUserVaultBalanceInUsdIncludingDisplaced(state, member.id);
        if (!value) {
          continue;
        }
        sum = (sum ?? 0) + value.toNumber();
      }
      return sum ?? -1;
    },
    filters.sortDirection
  ).map(r => r.id);
}
