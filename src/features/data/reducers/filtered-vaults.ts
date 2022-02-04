import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { PlatformEntity } from '../entities/platform';
/**
 * State containing Vault infos
 */
export type FilteredVaultsState = {
  sort: 'tvl' | 'apy' | 'safety' | 'default';
  vaultCategory: 'all' | 'featured' | 'stablecoins' | 'blue-chips' | 'beefy';
  userCategory: 'all' | 'eligible' | 'deposited';
  vaultType: 'all' | 'lps' | 'single-asset';
  searchText: string;
  chainIds: ChainEntity['id'][];
  platformIds: PlatformEntity['id'][];
  showRetired: boolean;
  onlyMoonpot: boolean;
  onlyBoosted: boolean;
};
export const initialFilteredVaultsState: FilteredVaultsState = {
  sort: 'default',
  vaultCategory: 'all',
  userCategory: 'all',
  vaultType: 'all',
  searchText: '',
  chainIds: [],
  platformIds: [],
  showRetired: false,
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
    setSort(sliceState, action: PayloadAction<{ sort: FilteredVaultsState['sort'] }>) {
      sliceState.sort = action.payload.sort;
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
    setPlatformIds(sliceState, action: PayloadAction<FilteredVaultsState['platformIds']>) {
      sliceState.platformIds = action.payload;
    },
    setShowRetired(sliceState, action: PayloadAction<FilteredVaultsState['showRetired']>) {
      sliceState.showRetired = action.payload;
    },
    setOnlyMoonpot(sliceState, action: PayloadAction<FilteredVaultsState['onlyMoonpot']>) {
      sliceState.onlyMoonpot = action.payload;
    },
    setOnlyBoosted(sliceState, action: PayloadAction<FilteredVaultsState['onlyBoosted']>) {
      sliceState.onlyBoosted = action.payload;
    },
  },
});

export const actions = filteredVaultsSlice.actions;
