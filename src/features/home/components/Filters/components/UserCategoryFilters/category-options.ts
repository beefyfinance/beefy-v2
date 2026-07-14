import type { UserCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';

export const CATEGORY_OPTIONS: Record<UserCategoryType, string> = {
  all: 'Filter-AllVaults',
  saved: 'Filter-Saved',
  deposited: 'Filter-MyVaults',
};
