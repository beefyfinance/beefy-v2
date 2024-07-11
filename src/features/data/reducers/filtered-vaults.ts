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
  VaultAssetType,
  VaultCategoryType,
  StrategiesType,
} from './filtered-vaults-types';
import { isValidUserCategory } from './filtered-vaults-types';
import type { VaultEntity } from '../entities/vault';
import { fetchAllVaults } from '../actions/vaults';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number';

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
  vaultCategory: VaultCategoryType[];
  userCategory: UserCategoryType;
  strategyType: StrategiesType;
  assetType: VaultAssetType[];
  searchText: string;
  chainIds: ChainEntity['id'][];
  platformIds: PlatformEntity['id'][];
  onlyRetired: boolean;
  onlyPaused: boolean;
  onlyBoosted: boolean;
  onlyZappable: boolean;
  onlyEarningPoints: boolean;
  onlyUnstakedClm: boolean;
  filteredVaultIds: VaultEntity['id'][];
  sortedFilteredVaultIds: VaultEntity['id'][];
  showMinimumUnderlyingTvl: boolean;
  showMinimumUnderlyingTvlLarge: boolean;
  minimumUnderlyingTvl: BigNumber;
};
export type FilteredVaultBooleanKeys = KeysOfType<Omit<FilteredVaultsState, 'reseted'>, boolean>;

export type FilteredVaultBigNumberKeys = KeysOfType<FilteredVaultsState, BigNumber>;

const initialFilteredVaultsState: FilteredVaultsState = {
  reseted: true,
  sort: 'default',
  sortDirection: 'desc',
  vaultCategory: [],
  userCategory: 'all',
  strategyType: 'all',
  assetType: [],
  searchText: '',
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
  showMinimumUnderlyingTvl: false,
  showMinimumUnderlyingTvlLarge: false,
  minimumUnderlyingTvl: BIG_ZERO,
};

export const filteredVaultsSlice = createSlice({
  name: 'filtered-vaults',
  initialState: initialFilteredVaultsState,
  reducers: {
    reset(sliceState) {
      return {
        ...initialFilteredVaultsState,
        filteredVaultIds: sliceState.filteredVaultIds,
        sortedFilteredVaultIds: sliceState.sortedFilteredVaultIds,
      };
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
    setBigNumber(
      sliceState,
      action: PayloadAction<{
        filter: FilteredVaultBigNumberKeys;
        value: BigNumber;
      }>
    ) {
      sliceState.reseted = false;
      sliceState[action.payload.filter] = action.payload.value;
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

export const userCategoryTransform = createTransform(
  (userCategory: FilteredVaultsState['userCategory']) => userCategory,
  (userCategoryFromLocalStorage: string): FilteredVaultsState['userCategory'] => {
    return isValidUserCategory(userCategoryFromLocalStorage) ? userCategoryFromLocalStorage : 'all';
  },
  { whitelist: ['userCategory'] }
);

export const bigNumberTransform = createTransform(
  (bigNumber: BigNumber) => bigNumber.toString(),
  (storedBigNumber: string) => new BigNumber(storedBigNumber),
  { whitelist: ['minimumUnderlyingTvl'] }
);

export const chainIdsTransform = createTransform(
  (chanIds: FilteredVaultsState['chainIds']) => chanIds,
  (chainIdsFromLocalStorage: FilteredVaultsState['chainIds']) => {
    // TODO fix so we use real list of eol chains
    return chainIdsFromLocalStorage.filter(
      chainId => !['heco', 'harmony', 'moonriver', 'aurora', 'emerald', 'celo'].includes(chainId)
    );
  },
  { whitelist: ['chainIds'] }
);
