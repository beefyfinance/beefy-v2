import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { FilterValues } from '../reducers/filtered-vaults-types.ts';
import { FILTER_DEFAULTS, filtersDependOnData } from './filter-values.ts';

function withFilters(values: Partial<FilterValues>): FilterValues {
  return { ...FILTER_DEFAULTS, ...values };
}

describe('filtersDependOnData', () => {
  it('is false for defaults (nothing reads live tick data)', () => {
    expect(filtersDependOnData(FILTER_DEFAULTS)).toBe(false);
  });

  it.each([
    ['onlyBoosted', withFilters({ onlyBoosted: true })],
    ['onlyZappable', withFilters({ onlyZappable: true })],
    ['deposited category', withFilters({ userCategory: 'deposited' })],
    ['minimumUnderlyingTvl > 0', withFilters({ minimumUnderlyingTvl: new BigNumber(100) })],
  ])('is true when %s is active', (_label, filters) => {
    expect(filtersDependOnData(filters)).toBe(true);
  });

  it.each([
    ['saved category', withFilters({ userCategory: 'saved' })],
    ['search text', withFilters({ searchText: 'eth' })],
    ['vault category', withFilters({ vaultCategory: ['stable'] })],
    ['only retired', withFilters({ onlyRetired: true })],
    ['asset type', withFilters({ assetType: ['clm'] })],
    ['zero minimumUnderlyingTvl', withFilters({ minimumUnderlyingTvl: new BigNumber(0) })],
  ])(
    'is false when only %s is active (membership is static across data ticks)',
    (_label, filters) => {
      expect(filtersDependOnData(filters)).toBe(false);
    }
  );
});
