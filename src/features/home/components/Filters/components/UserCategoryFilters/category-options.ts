import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults-types.ts';

export const CATEGORY_OPTIONS: Record<FilteredVaultsState['userCategory'], string> = {
  all: 'Filter-AllVaults',
  saved: 'Filter-Saved',
  deposited: 'Filter-MyVaults',
};
