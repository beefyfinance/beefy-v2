import type { StrategiesType } from '../../../../../data/reducers/filtered-vaults-types.ts';

export const TYPE_OPTIONS = {
  all: 'Filter-DropdwnDflt',
  vaults: 'Filter-Vaults',
  pools: 'Filter-Pools',
} as const satisfies Record<StrategiesType, string>;
