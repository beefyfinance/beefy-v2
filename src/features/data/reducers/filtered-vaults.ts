import { createSlice, type Draft, type PayloadAction } from '@reduxjs/toolkit';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import { FILTER_DEFAULTS, mergePreset } from '../utils/filter-values.ts';
import { buildInitialFilteredVaultsState } from './filtered-vaults-storage.ts';
import {
  FilterContent,
  type FilteredVaultsPreset,
  type FilteredVaultsReconcile,
  type FilterValues,
} from './filtered-vaults-types.ts';

export const filteredVaultsSlice = createSlice({
  name: 'filtered-vaults',
  // lazy so importing this module outside a browser never touches window/localStorage
  initialState: buildInitialFilteredVaultsState,
  reducers: {
    reset(sliceState) {
      sliceState.pending = FILTER_DEFAULTS;
      sliceState.filterContent = FilterContent.Filter;
    },
    /** reset + update: defaults with the given preset on top */
    set(sliceState, action: PayloadAction<FilteredVaultsPreset>) {
      sliceState.pending = mergePreset(FILTER_DEFAULTS, action.payload);
      sliceState.filterContent = FilterContent.Filter;
    },
    update(sliceState, action: PayloadAction<FilteredVaultsPreset>) {
      sliceState.pending = mergePreset(sliceState.pending, action.payload);
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
    /** middleware-only: moves pending to applied */
    applyPending(sliceState) {
      sliceState.applied = sliceState.pending;
    },
    /** url-sync only: preset over defaults to pending AND applied at once (urls skip the apply debounce) */
    setFromUrl(sliceState, action: PayloadAction<FilteredVaultsPreset>) {
      const values = mergePreset(FILTER_DEFAULTS, action.payload);
      sliceState.pending = values;
      sliceState.applied = values;
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
        state.filteredVaultIds = action.payload.filtered;
        state.sortedFilteredVaultIds = action.payload.sorted;
      });
  },
});

export const filteredVaultsActions = filteredVaultsSlice.actions;
