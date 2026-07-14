import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain.ts';
import type { PlatformEntity } from '../entities/platform.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { KeysOfType } from '../utils/types-utils.ts';

export const SORT_TYPES = ['default', 'tvl', 'apy', 'daily', 'depositValue'] as const;
export type SortType = (typeof SORT_TYPES)[number];

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
  filteredVaultIds: VaultEntity['id'][];
  sortedFilteredVaultIds: VaultEntity['id'][];
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
