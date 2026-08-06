import { describe, expect, it } from 'vitest';
import { serializeFilters } from '../utils/filter-url.ts';
import { FILTER_DEFAULTS } from '../utils/filter-values.ts';
import { composeInitialFilterValues } from './filtered-vaults-storage.ts';

describe('composeInitialFilterValues', () => {
  it('returns defaults when there is no storage and no url', () => {
    expect(composeInitialFilterValues(null, null)).toEqual(FILTER_DEFAULTS);
  });

  it('overlays stored values on defaults, including wallet-scoped usercat', () => {
    const values = composeInitialFilterValues('?chain=base&boosted=1&tab=deposited', null);
    expect(values.chainIds).toEqual(['base']);
    expect(values.onlyBoosted).toBe(true);
    expect(values.userCategory).toBe('deposited');
    // untouched fields stay default
    expect(values.searchText).toBe('');
    expect(values.sort).toBe('default');
  });

  it('lets a recognized url win over storage, on top of defaults', () => {
    const values = composeInitialFilterValues('?chain=base&boosted=1', '?q=usdc');
    // url filters applied
    expect(values.searchText).toBe('usdc');
    // stored filters the url does not carry are reset, not mixed in
    expect(values.chainIds).toEqual([]);
    expect(values.onlyBoosted).toBe(false);
  });

  it('resets stored userCategory when a url without one wins', () => {
    const values = composeInitialFilterValues('?tab=saved&chain=base', '?q=usdc');
    expect(values.userCategory).toBe('all');
    expect(values.chainIds).toEqual([]);
    expect(values.searchText).toBe('usdc');
  });

  it('applies tab from the url like any other filter', () => {
    const values = composeInitialFilterValues(null, '?tab=deposited&chain=base');
    expect(values.userCategory).toBe('deposited');
    expect(values.chainIds).toEqual(['base']);
  });

  it('falls back to storage when the url has no recognized params', () => {
    const values = composeInitialFilterValues('?chain=base', '?utm_source=x');
    expect(values.chainIds).toEqual(['base']);
  });

  it('survives junk storage content', () => {
    const values = composeInitialFilterValues('not?a=valid&&&%%%storage=string', null);
    expect(values.sort).toBe('default');
    expect(values.chainIds).toEqual([]);
  });

  it('round-trips through the storage serialization', () => {
    const original = composeInitialFilterValues('?chain=base&tab=deposited&sort=tvl', null);
    const stored = serializeFilters(original);
    expect(composeInitialFilterValues(stored, null)).toEqual(original);
  });
});
