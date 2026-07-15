import type { Draft } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { FilteredVaultsPreset, FilterValues } from '../reducers/filtered-vaults-types.ts';
import { areArraysEqual, isOneOf } from './array-utils.ts';

/** Default filter values; also the exhaustive source of FilterValues keys */
export const FILTER_DEFAULTS: FilterValues = {
  sort: 'default',
  sortDirection: 'desc',
  subSort: {
    apy: 'default',
  },
  vaultCategory: [],
  userCategory: 'all',
  strategyType: 'all',
  assetType: [],
  searchText: '',
  chainIds: [],
  platformIds: [],
  onlyRetired: false,
  onlyPaused: false,
  onlyBoosted: false,
  onlyZappable: false,
  onlyEarningPoints: false,
  onlyUnstakedClm: false,
  minimumUnderlyingTvl: BIG_ZERO,
};

const FILTER_VALUE_KEYS = Object.keys(FILTER_DEFAULTS) as Array<keyof FilterValues>;

const SORT_VALUE_KEYS = ['sort', 'sortDirection', 'subSort'] as const satisfies Array<
  keyof FilterValues
>;

/** preset over base, subSort merged key-wise; untouched fields share refs (state is replacement-only) */
export function mergePreset(
  input: FilterValues | Draft<FilterValues>,
  preset: FilteredVaultsPreset
): FilterValues {
  // immer does not draft class instances, so Draft<BigNumber> is only a type-level fiction
  const base = input as FilterValues;
  const { subSort, ...rest } = preset;
  const merged: FilterValues = {
    ...base,
    ...rest,
    subSort: { ...base.subSort, ...subSort },
  };
  // fix subSort vs sort
  if (merged.sort !== 'apy' && merged.subSort.apy !== 'default') {
    merged.subSort = { ...merged.subSort, apy: 'default' };
  }
  return merged;
}

function valueEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return areArraysEqual(a, b);
  }
  if (BigNumber.isBigNumber(a) && BigNumber.isBigNumber(b)) {
    return a.eq(b);
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aEntries = Object.entries(a);
    return (
      aEntries.length === Object.keys(b).length &&
      aEntries.every(([key, value]) => (b as Record<string, unknown>)[key] === value)
    );
  }
  return false;
}

export type FilterValuesDiff = {
  filtersChanged: boolean;
  sortChanged: boolean;
};

export function diffFilterValues(a: FilterValues, b: FilterValues): FilterValuesDiff {
  let filtersChanged = false;
  let sortChanged = false;
  for (const key of FILTER_VALUE_KEYS) {
    if (!valueEqual(a[key], b[key])) {
      if (isOneOf(SORT_VALUE_KEYS, key)) {
        sortChanged = true;
      } else {
        filtersChanged = true;
      }
    }
  }
  return { filtersChanged, sortChanged };
}

export function filterValuesEqual(a: FilterValues, b: FilterValues): boolean {
  const { filtersChanged, sortChanged } = diffFilterValues(a, b);
  return !filtersChanged && !sortChanged;
}

/** Filters whose `vaultPassesFilters` outcome can change when data updates */
export const DATA_DEPENDENT_FILTERS: ReadonlyArray<{
  /** the filter this row guards, for readability */
  readonly filter: keyof FilterValues;
  /** true when the filter is currently active (and so its live-data predicate runs) */
  readonly isActive: (filters: FilterValues) => boolean;
}> = [
  // selectVaultIsBoostedForFilter
  { filter: 'onlyBoosted', isActive: f => f.onlyBoosted },
  // selectVaultSupportsZap
  { filter: 'onlyZappable', isActive: f => f.onlyZappable },
  {
    // user balance data (deposited vault ids / selectUserBalanceOfToken)
    filter: 'userCategory',
    isActive: f => f.userCategory === 'deposited',
  },
  {
    // selectVaultUnderlyingTvlUsd
    filter: 'minimumUnderlyingTvl',
    isActive: f => f.minimumUnderlyingTvl.gt(0),
  },
];

/** true when any currently-active filter's membership can shift as live data updates */
export function filtersDependOnData(filters: FilterValues): boolean {
  return DATA_DEPENDENT_FILTERS.some(({ isActive }) => isActive(filters));
}
