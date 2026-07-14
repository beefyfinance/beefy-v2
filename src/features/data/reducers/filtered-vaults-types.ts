import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain.ts';
import type { PlatformEntity } from '../entities/platform.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { KeysOfType } from '../utils/types-utils.ts';
import { hasSearchText } from '../utils/vault-search.ts';

export const SORT_TYPES = ['default', 'tvl', 'apy', 'daily', 'depositValue'] as const;
export type SortType = (typeof SORT_TYPES)[number];

export type EffectiveSortType = SortType | 'relevance';

/** while searching, results sort by relevance unless the user explicitly picked a sort */
export function isRelevanceSortActive(filters: {
  searchText: string;
  sortPickedDuringSearch: boolean;
}): boolean {
  return hasSearchText(filters.searchText) && !filters.sortPickedDuringSearch;
}

/** an explicit sort in a preset/restored session wins over relevance */
export function isSortPickedInPreset(searchText: string | undefined, sort: SortType | undefined) {
  return hasSearchText(searchText ?? '') && (sort ?? 'default') !== 'default';
}

export type SortDirectionType = 'asc' | 'desc';

export const VAULT_CATEGORIES = ['stable', 'bluechip', 'meme', 'correlated'] as const;
export type VaultCategoryType = (typeof VAULT_CATEGORIES)[number];

export const VAULT_ASSET_TYPES = ['lps', 'single', 'clm'] as const;
export type VaultAssetType = (typeof VAULT_ASSET_TYPES)[number];

export const STRATEGY_TYPES = ['all', 'pools', 'vaults'] as const;
export type StrategiesType = (typeof STRATEGY_TYPES)[number];

export const USER_CATEGORIES = ['all', 'saved', 'deposited'] as const;
export type UserCategoryType = (typeof USER_CATEGORIES)[number];

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

export type FilterValues = {
  sort: SortType;
  subSort: SubSortsState;
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
  minimumUnderlyingTvl: BigNumber;
};

/** `pending` is what the controls bind to; `applied` is the debounce-settled copy driving recalc, url and storage */
export type FilteredVaultsState = {
  pending: FilterValues;
  applied: FilterValues;
  /**
   * user chose a sort while searching, so relevance does not override it.
   * kept outside FilterValues: it is derived ui state, never serialized to url/storage nor diffed.
   */
  sortPickedDuringSearch: boolean;
  filteredVaultIds: VaultEntity['id'][];
  sortedFilteredVaultIds: VaultEntity['id'][];
  /** searchText the last completed recalc ran with; count display is hidden until it matches pending */
  recalculatedForSearchText: string;
  /** the sorted ids are relevance-ranked; false when all matches tie (selected sort applies) */
  searchRanked: boolean;
  filterContent: FilterContent;
};

export type FilteredVaultsPreset = Partial<Omit<FilterValues, 'subSort'>> & {
  subSort?: Partial<SubSortsState>;
};

export type FilteredVaultsReconcile = {
  platformIds: PlatformEntity['id'][];
  chainIds: ChainEntity['id'][];
};

export type FilteredVaultBooleanKeys = KeysOfType<FilterValues, boolean>;
export type FilteredVaultBigNumberKeys = KeysOfType<FilterValues, BigNumber>;
