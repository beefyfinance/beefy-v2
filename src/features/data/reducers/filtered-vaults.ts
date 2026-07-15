import { createSlice, type Draft, type PayloadAction } from '@reduxjs/toolkit';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import { FILTER_DEFAULTS, mergePreset } from '../utils/filter-values.ts';
import { hasSearchText } from '../utils/vault-search.ts';
import { buildInitialFilteredVaultsState } from './filtered-vaults-storage.ts';
import {
  FilterContent,
  type FilteredVaultsPreset,
  type FilteredVaultsReconcile,
  type FilterValues,
  isSortPickedInPreset,
} from './filtered-vaults-types.ts';

export const filteredVaultsSlice = createSlice({
  name: 'filtered-vaults',
  // lazy so importing this module outside a browser never touches window/localStorage
  initialState: buildInitialFilteredVaultsState,
  reducers: {
    reset(sliceState) {
      sliceState.pending = FILTER_DEFAULTS;
      sliceState.sortPickedDuringSearch = false;
      sliceState.filterContent = FilterContent.Filter;
    },
    /** reset + update: defaults with the given preset on top */
    set(sliceState, action: PayloadAction<FilteredVaultsPreset>) {
      const values = mergePreset(FILTER_DEFAULTS, action.payload);
      sliceState.pending = values;
      sliceState.sortPickedDuringSearch = isSortPickedInPreset(values.searchText, values.sort);
      sliceState.filterContent = FilterContent.Filter;
    },
    update(sliceState, action: PayloadAction<FilteredVaultsPreset>) {
      // capture as primitives up front so the relevance bookkeeping never compares immer drafts
      const prevSearchText = sliceState.pending.searchText;
      const prevSort = sliceState.pending.sort;
      const prevSortDirection = sliceState.pending.sortDirection;
      const prevSubSortApy = sliceState.pending.subSort.apy;
      const next = mergePreset(sliceState.pending, action.payload);
      sliceState.pending = next;

      // clearing or starting a fresh search session re-enables relevance sort
      if (
        prevSearchText !== next.searchText &&
        (!hasSearchText(next.searchText) || !hasSearchText(prevSearchText))
      ) {
        sliceState.sortPickedDuringSearch = false;
      }
      // an explicit sort while searching disables the relevance override
      const sortChanged =
        next.sort !== prevSort ||
        next.sortDirection !== prevSortDirection ||
        next.subSort.apy !== prevSubSortApy;
      if (sortChanged && hasSearchText(next.searchText)) {
        sliceState.sortPickedDuringSearch = true;
      }
    },
    reconcile(sliceState, action: PayloadAction<FilteredVaultsReconcile>) {
      const knownPlatformIds = new Set(action.payload.platformIds);
      const knownChainIds = new Set(action.payload.chainIds);
      const prune = (values: FilterValues | Draft<FilterValues>): FilterValues => {
        // immer does not draft class instances, so Draft<BigNumber> is only a type-level fiction
        const base = values as FilterValues;
        return {
          ...base,
          platformIds: base.platformIds.filter(id => knownPlatformIds.has(id)),
          chainIds: base.chainIds.filter(id => knownChainIds.has(id)),
        };
      };
      sliceState.pending = prune(sliceState.pending);
      sliceState.applied = prune(sliceState.applied);
    },
    /** url-sync only: preset over defaults to pending; the immediate recalc commits it to applied */
    setFromUrl(sliceState, action: PayloadAction<FilteredVaultsPreset>) {
      const values = mergePreset(FILTER_DEFAULTS, action.payload);
      sliceState.pending = values;
      sliceState.sortPickedDuringSearch = isSortPickedInPreset(values.searchText, values.sort);
    },
    setFilterContent(sliceState, action: PayloadAction<FilterContent>) {
      sliceState.filterContent = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllVaults.fulfilled, (state, action) => {
        if (state.filteredVaultIds.length === 0) {
          const allVaultIds = Object.values(action.payload.byChainId).flatMap(vaults =>
            vaults.map(v => v.entity.id)
          );
          state.filteredVaultIds = allVaultIds;
          state.sortedFilteredVaultIds = allVaultIds;
        }
      })
      .addCase(recalculateFilteredVaultsAction.fulfilled, (state, action) => {
        // commit the snapshot the recalc ran against: applied + results update atomically
        state.applied = action.payload.applied;
        state.filteredVaultIds = action.payload.filtered;
        state.sortedFilteredVaultIds = action.payload.sorted;
        state.searchRanked = action.payload.searchRanked;
      });
  },
});

export const filteredVaultsActions = filteredVaultsSlice.actions;
