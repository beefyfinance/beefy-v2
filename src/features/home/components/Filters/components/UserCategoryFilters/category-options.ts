import { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';

export const CATEGORY_OPTIONS: Record<FilteredVaultsState['userCategory'], string> = {
  all: 'Filter-AllVaults',
  eligible: 'Filter-Eligible',
  deposited: 'Filter-MyVaults',
};
