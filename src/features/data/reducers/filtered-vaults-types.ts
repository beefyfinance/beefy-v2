export type SortType =
  | 'tvl'
  | 'apy'
  | 'daily'
  | 'safetyScore'
  | 'default'
  | 'depositValue'
  | 'walletValue';

export type SortDirectionType = 'asc' | 'desc';

export type VaultCategoryType = 'stable' | 'bluechip' | 'correlated';

export type VaultAssetType = 'lps' | 'single' | 'clm';

export type StrategiesType = 'all' | 'pools' | 'vaults';

export type UserCategoryType = 'all' | 'saved' | 'deposited';

export function isValidUserCategory(category: string): category is UserCategoryType {
  return ['all', 'saved', 'deposited'].includes(category);
}

export type AvgApySortType = 'default' | 'avg7d' | 'avg30d' | 'avg90d';

export type SubSortsState = {
  apy: AvgApySortType;
};

export type SortWithSubSort = keyof SubSortsState & SortType;
