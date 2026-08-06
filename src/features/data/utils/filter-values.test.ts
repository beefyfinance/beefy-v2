import { describe, expect, it } from 'vitest';
import { FILTER_DEFAULTS, mergePreset } from './filter-values.ts';

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
