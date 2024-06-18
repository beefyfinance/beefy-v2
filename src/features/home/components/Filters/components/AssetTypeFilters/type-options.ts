import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';

export const TYPE_OPTIONS: Record<FilteredVaultsState['assetType'], string> = {
  all: 'Filter-DropdwnDflt',
  single: 'Filter-AsstSingle',
  lps: 'Filter-LP',
  clm: 'Filter-CLM',
};
