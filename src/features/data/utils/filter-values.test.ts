import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { FilterValues } from '../reducers/filtered-vaults-types.ts';
import { FILTER_DEFAULTS, filtersDependOnData, mergePreset } from './filter-values.ts';

describe('mergePreset onlyUnstakedClm', () => {
  it('drops the filter when the user category changes', () => {
    const base = { ...FILTER_DEFAULTS, userCategory: 'deposited' as const, onlyUnstakedClm: true };
    expect(mergePreset(base, { userCategory: 'all' }).onlyUnstakedClm).toBe(false);
  });

  it('drops the filter even when the user category is re-selected', () => {
    const base = { ...FILTER_DEFAULTS, userCategory: 'deposited' as const, onlyUnstakedClm: true };
    expect(mergePreset(base, { userCategory: 'deposited' }).onlyUnstakedClm).toBe(false);
  });

  it('keeps an explicit value alongside a user category (unstaked clm banner)', () => {
    const merged = mergePreset(FILTER_DEFAULTS, {
      userCategory: 'deposited',
      onlyUnstakedClm: true,
    });
    expect(merged.onlyUnstakedClm).toBe(true);
    expect(merged.userCategory).toBe('deposited');
  });

  it('leaves the filter alone when the preset does not touch the user category', () => {
    const base = { ...FILTER_DEFAULTS, userCategory: 'deposited' as const, onlyUnstakedClm: true };
    expect(mergePreset(base, { subSort: { apy: 'default' } }).onlyUnstakedClm).toBe(true);
  });
});

describe('filtersDependOnData', () => {
  function withFilters(values: Partial<FilterValues>): FilterValues {
    return { ...FILTER_DEFAULTS, ...values };
  }

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
