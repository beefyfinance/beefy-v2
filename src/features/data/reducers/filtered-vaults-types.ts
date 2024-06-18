export type SortType =
  | 'tvl'
  | 'apy'
  | 'daily'
  | 'safetyScore'
  | 'default'
  | 'depositValue'
  | 'walletValue';

export type SortDirectionType = 'asc' | 'desc';

export type VaultCategoryType = 'all' | 'stable' | 'bluechip' | 'correlated';

export type VaultAssetType = 'all' | 'lps' | 'single' | 'clm';

export type StrategiesType = 'all' | 'pools' | 'vaults';

export type UserCategoryType = 'all' | 'saved' | 'deposited';

export function isValidUserCategory(category: string): category is UserCategoryType {
  return ['all', 'saved', 'deposited'].includes(category);
}
