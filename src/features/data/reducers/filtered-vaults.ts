import { createSlice, prepareAutoBatched, type PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import createTransform from 'redux-persist/es/createTransform';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import { hasSearchText } from '../utils/vault-search.ts';
import {
  FilterContent,
  type FilteredVaultBigNumberKeys,
  type FilteredVaultBooleanKeys,
  type FilteredVaultsPreset,
  type FilteredVaultsState,
  isSortPickedInPreset,
  type SetSubSortPayload,
} from './filtered-vaults-types.ts';

const initialFilteredVaultsState: FilteredVaultsState = {
  reseted: true,
  sort: 'default',
  sortDirection: 'desc',
  sortPickedDuringSearch: false,
  subSort: {
    apy: 'default',
  },
  vaultCategory: [],
  userCategory: 'all',
  strategyType: 'all',
  assetType: [],
  searchText: '',
  recalculatedForSearchText: '',
  searchRanked: false,
  chainIds: [],
  platformIds: [],
  onlyRetired: false,
  onlyPaused: false,
  onlyBoosted: false,
  onlyZappable: false,
  onlyEarningPoints: false,
  onlyUnstakedClm: false,
  filteredVaultIds: [],
  sortedFilteredVaultIds: [],
  minimumUnderlyingTvl: BIG_ZERO,
  filterContent: FilterContent.Filter,
};

export const filteredVaultsSlice = createSlice({
  name: 'filtered-vaults',
  initialState: initialFilteredVaultsState,
  reducers: {
    reset(sliceState, action: PayloadAction<FilteredVaultsPreset | undefined>) {
      return {
        ...initialFilteredVaultsState,
        ...action.payload,
        sortPickedDuringSearch: isSortPickedInPreset(
          action.payload?.searchText,
          action.payload?.sort
        ),
        filteredVaultIds: sliceState.filteredVaultIds,
        sortedFilteredVaultIds: sliceState.sortedFilteredVaultIds,
      };
    },
    setSort(sliceState, action: PayloadAction<FilteredVaultsState['sort']>) {
      sliceState.reseted = false;
      sliceState.sort = action.payload;
      markSortPicked(sliceState);
    },
    setSubSort(sliceState, action: PayloadAction<SetSubSortPayload>) {
      sliceState.reseted = false;
      const { column, value } = action.payload;
      sliceState.subSort = {
        ...sliceState.subSort,
        [column]: value,
      };
      markSortPicked(sliceState);
    },
    setSortDirection(sliceState, action: PayloadAction<FilteredVaultsState['sortDirection']>) {
      sliceState.reseted = false;
      sliceState.sortDirection = action.payload;
      markSortPicked(sliceState);
    },
    setSortFieldAndDirection(
      sliceState,
      action: PayloadAction<{
        field: FilteredVaultsState['sort'];
        direction: FilteredVaultsState['sortDirection'];
      }>
    ) {
      sliceState.reseted = false;
      sliceState.sort = action.payload.field;
      sliceState.sortDirection = action.payload.direction;
      markSortPicked(sliceState);
    },
    setVaultCategory(sliceState, action: PayloadAction<FilteredVaultsState['vaultCategory']>) {
      sliceState.reseted = false;
      sliceState.vaultCategory = action.payload;
    },
    setStrategyType(sliceState, action: PayloadAction<FilteredVaultsState['strategyType']>) {
      sliceState.reseted = false;
      sliceState.strategyType = action.payload;
    },
    setUserCategory(sliceState, action: PayloadAction<FilteredVaultsState['userCategory']>) {
      sliceState.reseted = false;
      sliceState.userCategory = action.payload;
      sliceState.onlyUnstakedClm = false; // reset this filter when user category changes
    },
    setAssetType(sliceState, action: PayloadAction<FilteredVaultsState['assetType']>) {
      sliceState.reseted = false;
      sliceState.assetType = action.payload;
    },
    setSearchText(sliceState, action: PayloadAction<FilteredVaultsState['searchText']>) {
      sliceState.reseted = false;
      // clearing or starting a fresh search session re-enables relevance sort
      if (!hasSearchText(action.payload) || !hasSearchText(sliceState.searchText)) {
        sliceState.sortPickedDuringSearch = false;
      }
      sliceState.searchText = action.payload;
    },
    setChainIds(sliceState, action: PayloadAction<FilteredVaultsState['chainIds']>) {
      sliceState.reseted = false;
      sliceState.chainIds = action.payload;
    },
    setPlatformIds(sliceState, action: PayloadAction<FilteredVaultsState['platformIds']>) {
      sliceState.reseted = false;
      sliceState.platformIds = action.payload;
    },
    setFilterContent(sliceState, action: PayloadAction<FilteredVaultsState['filterContent']>) {
      sliceState.reseted = false;
      sliceState.filterContent = action.payload;
    },
    setBoolean(
      sliceState,
      action: PayloadAction<{
        filter: FilteredVaultBooleanKeys;
        value: boolean;
      }>
    ) {
      sliceState.reseted = false;
      sliceState[action.payload.filter] = action.payload.value;
    },
    setBigNumber: {
      reducer(
        sliceState,
        action: PayloadAction<{
          filter: FilteredVaultBigNumberKeys;
          value: BigNumber;
        }>
      ) {
        sliceState.reseted = false;
        sliceState[action.payload.filter] = action.payload.value;
      },
      prepare: prepareAutoBatched<{
        filter: FilteredVaultBigNumberKeys;
        value: BigNumber;
      }>(),
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
        state.recalculatedForSearchText = action.payload.searchText;
        state.searchRanked = action.payload.searchRanked;
      });
  },
});

function markSortPicked(
  sliceState: Pick<FilteredVaultsState, 'searchText' | 'sortPickedDuringSearch'>
) {
  if (hasSearchText(sliceState.searchText)) {
    sliceState.sortPickedDuringSearch = true;
  }
}

export const filteredVaultsActions = filteredVaultsSlice.actions;

export const bigNumberTransform = createTransform(
  (bigNumber: BigNumber) => bigNumber.toString(),
  (storedBigNumber: string) => new BigNumber(storedBigNumber),
  { whitelist: ['minimumUnderlyingTvl'] }
);
