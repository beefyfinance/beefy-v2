import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChainEntity } from '../entities/chain';
import { PlatformEntity } from '../entities/platform';
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
  reseted: true,
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
      sliceState.reseted = false;
      sliceState.sort = action.payload;
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
    setOnlyMoonpot(sliceState, action: PayloadAction<FilteredVaultsState['onlyMoonpot']>) {
      sliceState.reseted = false;
      sliceState.onlyMoonpot = action.payload;
    },
    setOnlyBoosted(sliceState, action: PayloadAction<FilteredVaultsState['onlyBoosted']>) {
      sliceState.reseted = false;
      sliceState.onlyBoosted = action.payload;
    },
  },
});

export const filteredVaultsActions = filteredVaultsSlice.actions;
