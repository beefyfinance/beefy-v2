import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';

export const TYPE_OPTIONS: Record<FilteredVaultsState['strategyType'], string> = {
  all: 'Filter-DropdwnDflt',
  vaults: 'Filter-Vaults',
  pools: 'Filter-Pools',
};
