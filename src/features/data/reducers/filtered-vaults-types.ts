import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain.ts';
import type { PlatformEntity } from '../entities/platform.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { KeysOfType } from '../utils/types-utils.ts';
import { hasSearchText } from '../utils/vault-search.ts';

export type SortType = 'tvl' | 'apy' | 'daily' | 'default' | 'depositValue';

export type EffectiveSortType = SortType | 'relevance';

/** while searching, results sort by relevance unless the user explicitly picked a sort */
export function isRelevanceSortActive(
  filters: Pick<FilteredVaultsState, 'searchText' | 'sortPickedDuringSearch'>
): boolean {
  return hasSearchText(filters.searchText) && !filters.sortPickedDuringSearch;
}

/** an explicit sort in a preset/restored session wins over relevance */
export function isSortPickedInPreset(searchText: string | undefined, sort: SortType | undefined) {
  return hasSearchText(searchText ?? '') && (sort ?? 'default') !== 'default';
}

export type SortDirectionType = 'asc' | 'desc';

export type VaultCategoryType = 'stable' | 'bluechip' | 'meme' | 'correlated';

export type VaultAssetType = 'lps' | 'single' | 'clm';

export type StrategiesType = 'all' | 'pools' | 'vaults';

export type UserCategoryType = 'all' | 'saved' | 'deposited';

export function isValidUserCategory(category: string): category is UserCategoryType {
  return ['all', 'saved', 'deposited'].includes(category);
}

export type AvgApySortType = 'default' | 7 | 30 | 90;

export type SubSortsState = {
  apy: AvgApySortType;
};

export type SortWithSubSort = keyof SubSortsState & SortType;

export enum FilterContent {
  Filter = 1,
  Platform,
  Chains,
}
/**
 * State containing Vault infos
 * Increase the version on persistReducer if you make changes to this shape
 */
export type FilteredVaultsState = {
  /**
   * Some form element have local copies of the state as putting it inside the
   * redux store would be too slow for user interactions. This bool tells them
   * to reset their local copy. The search text is (for now) the only example.
   **/
  reseted: boolean;
  sort: SortType;
  subSort: SubSortsState;
  sortDirection: SortDirectionType;
  /** user chose a sort while searching, so relevance does not override it */
  sortPickedDuringSearch: boolean;
  vaultCategory: VaultCategoryType[];
  userCategory: UserCategoryType;
  strategyType: StrategiesType;
  assetType: VaultAssetType[];
  searchText: string;
  /** searchText the last completed recalc ran with; count display is hidden until they match */
  recalculatedForSearchText: string;
  /** the sorted ids are relevance-ranked; false when all matches tie (selected sort applies) */
  searchRanked: boolean;
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
  minimumUnderlyingTvl: BigNumber;
  filterContent: FilterContent;
};

/** Filters a preset (e.g. parsed from url search params) can apply on top of the default state */
export type FilteredVaultsPreset = Partial<
  Omit<
    FilteredVaultsState,
    | 'reseted'
    | 'filteredVaultIds'
    | 'sortedFilteredVaultIds'
    | 'filterContent'
    | 'sortPickedDuringSearch'
    | 'recalculatedForSearchText'
    | 'searchRanked'
  >
>;

export type FilteredVaultBooleanKeys = KeysOfType<
  Omit<FilteredVaultsState, 'reseted' | 'sortPickedDuringSearch' | 'searchRanked'>,
  boolean
>;
export type FilteredVaultBigNumberKeys = KeysOfType<FilteredVaultsState, BigNumber>;
export type SetSubSortPayload<K extends SortWithSubSort = SortWithSubSort> = {
  [K in SortWithSubSort]: {
    column: K;
    value: SubSortsState[K];
  };
}[K];
