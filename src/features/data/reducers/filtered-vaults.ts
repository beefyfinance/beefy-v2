import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ChainEntity } from '../entities/chain';
import type { PlatformEntity } from '../entities/platform';
import type { KeysOfType } from '../utils/types-utils';
import createTransform from 'redux-persist/es/createTransform';
import type {
  SortDirectionType,
  SortType,
  UserCategoryType,
  VaultCategoryType,
  VaultType,
} from './filtered-vaults-types';
import { isValidUserCategory } from './filtered-vaults-types';

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
  sort: SortType;
  sortDirection: SortDirectionType;
  vaultCategory: VaultCategoryType;
  userCategory: UserCategoryType;
  vaultType: VaultType;
  searchText: string;
  chainIds: ChainEntity['id'][];
  platformIds: PlatformEntity['id'][];
  onlyRetired: boolean;
  onlyPaused: boolean;
  onlyBoosted: boolean;
  onlyZappable: boolean;
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
  platformIds: [],
  onlyRetired: false,
  onlyPaused: false,
  onlyBoosted: false,
  onlyZappable: false,
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
    setPlatformIds(sliceState, action: PayloadAction<FilteredVaultsState['platformIds']>) {
      sliceState.reseted = false;
      sliceState.platformIds = action.payload;
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
    setOnlyZappable(sliceState, action: PayloadAction<FilteredVaultsState['onlyZappable']>) {
      sliceState.reseted = false;
      sliceState.onlyZappable = action.payload;
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

export const userCategoryTransform = createTransform(
  (userCategory: FilteredVaultsState['userCategory']) => userCategory,
  (userCategoryFromLocalStorage: string): FilteredVaultsState['userCategory'] => {
    return isValidUserCategory(userCategoryFromLocalStorage) ? userCategoryFromLocalStorage : 'all';
  },
  { whitelist: ['userCategory'] }
);

export const chanIdsTransform = createTransform(
  (chanIds: FilteredVaultsState['chainIds']) => chanIds,
  (chainIdsFromLocalStorage: FilteredVaultsState['chainIds']) => {
    return chainIdsFromLocalStorage.filter(chainId => !['heco', 'harmony'].includes(chainId));
  },
  { whitelist: ['chainIds'] }
);
