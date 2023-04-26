export type SortType =
  | 'tvl'
  | 'apy'
  | 'daily'
  | 'safetyScore'
  | 'default'
  | 'depositValue'
  | 'walletValue';

export type SortDirectionType = 'asc' | 'desc';

export type VaultCategoryType = 'all' | 'featured' | 'stable' | 'bluechip' | 'beefy' | 'correlated';

export type VaultType = 'all' | 'lps' | 'single';

export type UserCategoryType = 'all' | 'saved' | 'deposited';

export type InvalidUserCategoryType = 'eligible';

export type UserCategoryFromLocalStorageType = UserCategoryType | InvalidUserCategoryType;

export function isUserCategoryInvalid(
  category: UserCategoryFromLocalStorageType
): category is InvalidUserCategoryType {
  return category === 'eligible';
}
