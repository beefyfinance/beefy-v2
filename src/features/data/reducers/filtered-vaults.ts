import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { PlatformEntity } from '../entities/platform';
/**
 * State containing Vault infos
 */
export type FilteredVaultsState = {
  sort: 'tvl' | 'apy' | 'safetyScore' | 'default';
  vaultCategory: 'all' | 'featured' | 'stable' | 'bluechip' | 'beefy';
  userCategory: 'all' | 'eligible' | 'deposited';
  vaultType: 'all' | 'lps' | 'single';
  searchText: string;
  chainIds: ChainEntity['id'][];
  platformId: PlatformEntity['id'] | null;
  onlyRetired: boolean;
  onlyMoonpot: boolean;
  onlyBoosted: boolean;
};
const initialFilteredVaultsState: FilteredVaultsState = {
  sort: 'default',
  vaultCategory: 'all',
  userCategory: 'all',
  vaultType: 'all',
  searchText: '',
  chainIds: [],
  platformId: null,
  onlyRetired: false,
  onlyMoonpot: false,
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
      sliceState.sort = action.payload;
    },
    setVaultCategory(sliceState, action: PayloadAction<FilteredVaultsState['vaultCategory']>) {
      sliceState.vaultCategory = action.payload;
    },
    setUserCategory(sliceState, action: PayloadAction<FilteredVaultsState['userCategory']>) {
      sliceState.userCategory = action.payload;
    },
    setVaultType(sliceState, action: PayloadAction<FilteredVaultsState['vaultType']>) {
      sliceState.vaultType = action.payload;
    },
    setSearchText(sliceState, action: PayloadAction<FilteredVaultsState['searchText']>) {
      sliceState.searchText = action.payload;
    },
    setChainIds(sliceState, action: PayloadAction<FilteredVaultsState['chainIds']>) {
      sliceState.chainIds = action.payload;
    },
    setPlatformId(sliceState, action: PayloadAction<FilteredVaultsState['platformId']>) {
      sliceState.platformId = action.payload;
    },
    setOnlyRetired(sliceState, action: PayloadAction<FilteredVaultsState['onlyRetired']>) {
      sliceState.onlyRetired = action.payload;
    },
    setOnlyMoonpot(sliceState, action: PayloadAction<FilteredVaultsState['onlyMoonpot']>) {
      sliceState.onlyMoonpot = action.payload;
    },
    setOnlyBoosted(sliceState, action: PayloadAction<FilteredVaultsState['onlyBoosted']>) {
      sliceState.onlyBoosted = action.payload;
    },
  },
});

export const filteredVaultsActions = filteredVaultsSlice.actions;
