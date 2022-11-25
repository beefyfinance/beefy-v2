import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { PlatformEntity } from '../entities/platform';
import { KeysOfType } from '../utils/types-utils';

/**
 * State containing Vault infos
 */
export type FilteredVaultsState = {
  /**
   * Some form element have local copies of the state as putting it inside the
   * redux store would be too slow for user interactions. This bool tells them
   * to reset their local copy. The search text is (for now) the only example.
   **/
  reseted: boolean;
  sort: 'tvl' | 'apy' | 'daily' | 'safetyScore' | 'default' | 'depositValue' | 'walletValue';
  sortDirection: 'asc' | 'desc';
  vaultCategory: 'all' | 'featured' | 'stable' | 'bluechip' | 'beefy';
  userCategory: 'all' | 'eligible' | 'deposited';
  vaultType: 'all' | 'lps' | 'single';
  searchText: string;
  chainIds: ChainEntity['id'][];
  platformId: PlatformEntity['id'] | null;
  onlyRetired: boolean;
  onlyPaused: boolean;
  onlyBoosted: boolean;
};
export type FilteredVaultBooleanKeys = KeysOfType<Omit<FilteredVaultsState, 'reseted'>, boolean>;

const initialFilteredVaultsState: FilteredVaultsState = {
  reseted: true,
  sort: 'default',
  sortDirection: 'desc',
  vaultCategory: 'all',
  userCategory: 'all',
  vaultType: 'all',
  searchText: '',
  chainIds: [],
  platformId: null,
  onlyRetired: false,
  onlyPaused: false,
  onlyBoosted: false,
};

export const filteredVaultsSlice = createSlice({
  name: 'filtered-vaults',
  initialState: initialFilteredVaultsState,
  reducers: {
    reset() {
      return initialFilteredVaultsState;
    },
    setSort(sliceState, action: PayloadAction<FilteredVaultsState['sort']>) {
      sliceState.reseted = false;
      sliceState.sort = action.payload;
    },
    setSortDirection(sliceState, action: PayloadAction<FilteredVaultsState['sortDirection']>) {
      sliceState.reseted = false;
      sliceState.sortDirection = action.payload;
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
    },
    setVaultCategory(sliceState, action: PayloadAction<FilteredVaultsState['vaultCategory']>) {
      sliceState.reseted = false;
      sliceState.vaultCategory = action.payload;
    },
    setUserCategory(sliceState, action: PayloadAction<FilteredVaultsState['userCategory']>) {
      sliceState.reseted = false;
      sliceState.userCategory = action.payload;
    },
    setVaultType(sliceState, action: PayloadAction<FilteredVaultsState['vaultType']>) {
      sliceState.reseted = false;
      sliceState.vaultType = action.payload;
    },
    setSearchText(sliceState, action: PayloadAction<FilteredVaultsState['searchText']>) {
      sliceState.reseted = false;
      sliceState.searchText = action.payload;
    },
    setChainIds(sliceState, action: PayloadAction<FilteredVaultsState['chainIds']>) {
      sliceState.reseted = false;
      sliceState.chainIds = action.payload;
    },
    setPlatformId(sliceState, action: PayloadAction<FilteredVaultsState['platformId']>) {
      sliceState.reseted = false;
      sliceState.platformId = action.payload;
    },
    setOnlyRetired(sliceState, action: PayloadAction<FilteredVaultsState['onlyRetired']>) {
      sliceState.reseted = false;
      sliceState.onlyRetired = action.payload;
    },
    setOnlyPaused(sliceState, action: PayloadAction<FilteredVaultsState['onlyPaused']>) {
      sliceState.reseted = false;
      sliceState.onlyPaused = action.payload;
    },
    setOnlyBoosted(sliceState, action: PayloadAction<FilteredVaultsState['onlyBoosted']>) {
      sliceState.reseted = false;
      sliceState.onlyBoosted = action.payload;
    },
    setBoolean(
      sliceState,
      action: PayloadAction<{ filter: FilteredVaultBooleanKeys; value: boolean }>
    ) {
      sliceState.reseted = false;
      sliceState[action.payload.filter] = action.payload.value;
    },
  },
});

export const filteredVaultsActions = filteredVaultsSlice.actions;
