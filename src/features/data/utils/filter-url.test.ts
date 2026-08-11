import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { FilteredVaultsPreset, FilterValues } from '../reducers/filtered-vaults-types.ts';
import {
  canonicalizeSearch,
  decideFilterUrlSync,
  FIELD_CODECS,
  parseFilterSearch,
  serializeFilters,
  serializeFilterState,
} from './filter-url.ts';
import { FILTER_DEFAULTS } from './filter-values.ts';

describe('serializeFilters', () => {
  it('serializes an empty preset to an empty string', () => {
    expect(serializeFilters({})).toBe('');
  });

  it('omits default values', () => {
    expect(
      serializeFilters({
        strategyType: 'all',
        sort: 'default',
        searchText: '',
        chainIds: [],
        minimumUnderlyingTvl: new BigNumber(0),
        onlyBoosted: false,
      })
    ).toBe('');
  });

  it('serializes a full preset in canonical order', () => {
    expect(
      serializeFilters({
        platformIds: ['curve', 'convex'],
        chainIds: ['ethereum', 'base'],
        vaultCategory: ['stable'],
        assetType: ['lps', 'clm'],
        strategyType: 'pools',
        userCategory: 'deposited',
        searchText: 'usdc',
        minimumUnderlyingTvl: new BigNumber(100000),
        onlyBoosted: true,
        sort: 'apy',
        sortDirection: 'asc',
        subSort: { apy: 30 },
      })
    ).toBe(
      '?platform=curve%2Cconvex&chain=ethereum%2Cbase&category=stable&type=lps%2Cclm&product=pools&tab=deposited&q=usdc&mintvl=100000&boosted=1&sort=apy&dir=asc&ssort=apy%3A30'
    );
  });

  it('appends carry params after filter params', () => {
    expect(serializeFilters({ chainIds: ['base'] }, { carry: [['utm_source', 'x']] })).toBe(
      '?chain=base&utm_source=x'
    );
  });
});

describe('parseFilterSearch', () => {
  it('returns recognized=false for a bare search', () => {
    const result = parseFilterSearch('');
    expect(result.recognized).toBe(false);
    expect(result.preset).toEqual({});
    expect(result.carry).toEqual([]);
  });

  it('round-trips a full preset', () => {
    const preset: FilteredVaultsPreset = {
      platformIds: ['curve'],
      chainIds: ['base'],
      vaultCategory: ['stable', 'bluechip'],
      assetType: ['single'],
      strategyType: 'vaults',
      searchText: 'a b/c&d+e',
      minimumUnderlyingTvl: new BigNumber('12345.67'),
      onlyBoosted: true,
      onlyRetired: true,
      sort: 'depositValue',
      sortDirection: 'asc',
      userCategory: 'saved',
    };
    const search = serializeFilters(preset);
    const parsed = parseFilterSearch(search);
    expect(parsed.recognized).toBe(true);
    expect(parsed.preset.platformIds).toEqual(['curve']);
    expect(parsed.preset.chainIds).toEqual(['base']);
    expect(parsed.preset.vaultCategory).toEqual(['stable', 'bluechip']);
    expect(parsed.preset.assetType).toEqual(['single']);
    expect(parsed.preset.strategyType).toBe('vaults');
    expect(parsed.preset.searchText).toBe('a b/c&d+e');
    expect(parsed.preset.minimumUnderlyingTvl?.toString(10)).toBe('12345.67');
    expect(parsed.preset.onlyBoosted).toBe(true);
    expect(parsed.preset.onlyRetired).toBe(true);
    expect(parsed.preset.sort).toBe('depositValue');
    expect(parsed.preset.sortDirection).toBe('asc');
    expect(parsed.preset.userCategory).toBe('saved');
    // serialize(parse(serialize(x))) is a fixed point
    expect(serializeFilters(parsed.preset)).toBe(search);
  });

  it('validates list items, dropping unknown ones', () => {
    const { preset, recognized } = parseFilterSearch('?chain=base,notachain&category=stable,junk');
    expect(recognized).toBe(true);
    expect(preset.chainIds).toEqual(['base']);
    expect(preset.vaultCategory).toEqual(['stable']);
  });

  it('treats known params with invalid values as recognized but unset', () => {
    const { preset, recognized } = parseFilterSearch('?product=junk&sort=junk&mintvl=abc');
    expect(recognized).toBe(true);
    expect(preset.strategyType).toBeUndefined();
    expect(preset.sort).toBeUndefined();
    expect(preset.minimumUnderlyingTvl).toBeUndefined();
  });

  it('parses flags, dropping any that equal the default', () => {
    expect(parseFilterSearch('?boosted=1').preset.onlyBoosted).toBe(true);
    expect(parseFilterSearch('?boosted=true').preset.onlyBoosted).toBe(true);
    // a bare flag and any non-truthy value both equal the default (false) and are dropped
    expect(parseFilterSearch('?boosted').preset.onlyBoosted).toBeUndefined();
    expect(parseFilterSearch('?boosted=false').preset.onlyBoosted).toBeUndefined();
    expect(parseFilterSearch('?boosted=0').preset.onlyBoosted).toBeUndefined();
    // ...but the param was still recognized
    expect(parseFilterSearch('?boosted=false').recognized).toBe(true);
  });

  it('rejects non-finite and non-positive mintvl', () => {
    expect(parseFilterSearch('?mintvl=Infinity').preset.minimumUnderlyingTvl).toBeUndefined();
    expect(parseFilterSearch('?mintvl=-5').preset.minimumUnderlyingTvl).toBeUndefined();
    expect(parseFilterSearch('?mintvl=0').preset.minimumUnderlyingTvl).toBeUndefined();
    expect(parseFilterSearch('?mintvl=1e6').preset.minimumUnderlyingTvl?.toString(10)).toBe(
      '1000000'
    );
  });

  it('parses sort, dir and subsort independently', () => {
    expect(parseFilterSearch('?sort=apy&ssort=apy:30&dir=asc').preset).toEqual({
      sort: 'apy',
      sortDirection: 'asc',
      subSort: { apy: 30 },
    });
    expect(parseFilterSearch('?sort=tvl').preset).toEqual({ sort: 'tvl' });
    // sort is case-sensitive
    expect(parseFilterSearch('?sort=depositValue').preset).toEqual({ sort: 'depositValue' });
    expect(parseFilterSearch('?sort=depositvalue').preset).toEqual({});
    // only avg-apy periods the ui offers are valid
    expect(parseFilterSearch('?ssort=apy:99').preset).toEqual({});
    // 'default' equals the default and is dropped
    expect(parseFilterSearch('?sort=default').preset).toEqual({});
  });

  it('keeps the last value when a param is duplicated', () => {
    expect(parseFilterSearch('?chain=base&chain=ethereum').preset.chainIds).toEqual(['ethereum']);
  });

  it('drops platform ids that are not id-shaped', () => {
    const { preset, recognized } = parseFilterSearch(
      `?platform=curve,<script>,foo bar,a,${'x'.repeat(256)},0xdead-beef`
    );
    expect(recognized).toBe(true);
    // <script>/space fail the shape; 'a' is too short (<2 chars); the 256-char id exceeds the 255 max
    expect(preset.platformIds).toEqual(['curve', '0xdead-beef']);
  });

  it('caps list params at 50 items', () => {
    const many = Array.from({ length: 60 }, (_, i) => `platform${i}`).join(',');
    const { preset } = parseFilterSearch(`?platform=${many}`);
    expect(preset.platformIds).toHaveLength(50);
  });

  it('returns unrecognized params as carry, preserving duplicates', () => {
    const { carry, recognized } = parseFilterSearch('?utm_source=x&utm_source=y&__flag=1');
    expect(recognized).toBe(false);
    expect(carry).toEqual([
      ['utm_source', 'x'],
      ['utm_source', 'y'],
      ['__flag', '1'],
    ]);
  });

  it('does not resolve prototype-chain keys as filter params', () => {
    const { preset, recognized, carry } = parseFilterSearch('?__proto__=1&constructor=2');
    expect(recognized).toBe(false);
    expect(Object.keys(preset)).toEqual([]);
    expect(carry).toEqual([
      ['__proto__', '1'],
      ['constructor', '2'],
    ]);
  });

  it('decodes + as space in values', () => {
    expect(parseFilterSearch('?q=btc+eth').preset.searchText).toBe('btc eth');
  });
});

describe('wallet-relative fields', () => {
  it('round-trips tab, omitting the all default', () => {
    expect(serializeFilters({ userCategory: 'all' })).toBe('');
    expect(serializeFilters({ userCategory: 'deposited' })).toBe('?tab=deposited');
    expect(parseFilterSearch('?tab=deposited').preset.userCategory).toBe('deposited');
  });

  it('rejects invalid tab values', () => {
    const { preset, recognized } = parseFilterSearch('?tab=junk');
    expect(preset.userCategory).toBeUndefined();
    expect(recognized).toBe(true);
  });

  it('never (de)serializes the redux-only unstaked flag', () => {
    expect(serializeFilters({ onlyUnstakedClm: true })).toBe('');
    // the key is unknown to the codec, so it falls through to carry
    const { preset, carry } = parseFilterSearch('?unstaked=1');
    expect(preset.onlyUnstakedClm).toBeUndefined();
    expect(carry).toEqual([['unstaked', '1']]);
  });
});

describe('FIELD_CODECS', () => {
  it('has a unique query key per field', () => {
    const queryKeys = Object.values(FIELD_CODECS)
      .filter(codec => codec !== false)
      .map(codec => codec.queryKey);
    expect(new Set(queryKeys).size).toBe(queryKeys.length);
  });
});

describe('canonicalizeSearch', () => {
  it('is a fixed point', () => {
    const messy = '?utm_source=x&chain=BASE,junk&boosted=true&q=a+b';
    const once = canonicalizeSearch(messy);
    expect(canonicalizeSearch(once)).toBe(once);
  });

  it('normalizes order and encoding, moving carry last', () => {
    expect(canonicalizeSearch('?utm_source=x&boosted=1&chain=base')).toBe(
      '?chain=base&boosted=1&utm_source=x'
    );
  });

  it('merges extra carry after parsed carry', () => {
    expect(canonicalizeSearch('?chain=base&utm_source=x', { carry: [['extra', 'y']] })).toBe(
      '?chain=base&utm_source=x&extra=y'
    );
  });

  it('canonicalizes an empty search to an empty string', () => {
    expect(canonicalizeSearch('')).toBe('');
    expect(canonicalizeSearch('?')).toBe('');
  });
});

describe('decideFilterUrlSync', () => {
  it('does nothing on first observation when url and state agree', () => {
    const result = decideFilterUrlSync('?chain=base', undefined, '?chain=base');
    expect(result).toEqual({ seenUrl: '?chain=base' });
  });

  it('applies a recognized url that differs from state (inbound wins)', () => {
    const result = decideFilterUrlSync('?chain=base', undefined, '?chain=ethereum');
    expect(result.seenUrl).toBe('?chain=base');
    expect(result.apply).toEqual({ chainIds: ['base'] });
    expect(result.write).toBeUndefined();
  });

  it('applies inbound over differing state (url wins over pending changes)', () => {
    const result = decideFilterUrlSync('?chain=base', '?boosted=1', '?boosted=1');
    expect(result.apply).toEqual({ chainIds: ['base'] });
  });

  it('writes state over a bare url (state wins on bare)', () => {
    const result = decideFilterUrlSync('', undefined, '?chain=base&boosted=1');
    expect(result).toEqual({ seenUrl: '', write: '?chain=base&boosted=1' });
  });

  it('writes when state changed under an unchanged url', () => {
    const result = decideFilterUrlSync('?chain=base', '?chain=base', '?chain=base&boosted=1');
    expect(result).toEqual({ seenUrl: '?chain=base', write: '?chain=base&boosted=1' });
  });

  it('writes state to a bare url that just changed (bare is not a recognized inbound)', () => {
    const result = decideFilterUrlSync('', '?chain=base', '?chain=base');
    expect(result).toEqual({ seenUrl: '', write: '?chain=base' });
  });

  it('preserves carry params in outbound writes', () => {
    const result = decideFilterUrlSync(
      '?utm_source=x&chain=base',
      '?chain=base&utm_source=x',
      '?chain=base&boosted=1'
    );
    expect(result.write).toBe('?chain=base&boosted=1&utm_source=x');
  });

  it('excludes carry params from the inbound comparison', () => {
    // url gained a utm param but the filters are unchanged: no apply, no write
    const result = decideFilterUrlSync('?chain=base&utm_source=x', '?chain=base', '?chain=base');
    expect(result).toEqual({ seenUrl: '?chain=base&utm_source=x' });
  });

  it('does not re-apply an unchanged url even when it differs from state', () => {
    // the url was already observed; state has since moved on and wins
    const result = decideFilterUrlSync('?chain=base', '?chain=base', '?boosted=1');
    expect(result.apply).toBeUndefined();
    expect(result.write).toBe('?boosted=1');
  });

  it('compares urls canonically, so encoding differences are not movement', () => {
    const result = decideFilterUrlSync('?q=a b', '?q=a+b', '?q=a+b');
    expect(result).toEqual({ seenUrl: '?q=a+b' });
  });
});

describe('serializeFilterState', () => {
  const full = (over: Partial<FilterValues>): FilterValues => ({ ...FILTER_DEFAULTS, ...over });

  it('drops the dormant sort while relevance is active (search, no explicit pick)', () => {
    // equivalent to serializing with a default sort: relevance is implied by ?q= alone, and
    // re-parsing a ?q=&sort= combo would read as an explicit pick and disable relevance
    expect(serializeFilterState(full({ searchText: 'eth', sort: 'tvl' }), false)).toBe(
      serializeFilters({ searchText: 'eth' })
    );
  });

  it('keeps the sort when it was explicitly picked during the search', () => {
    expect(serializeFilterState(full({ searchText: 'eth', sort: 'tvl' }), true)).toBe(
      serializeFilters({ searchText: 'eth', sort: 'tvl' })
    );
  });

  it('keeps the sort when there is no search', () => {
    expect(serializeFilterState(full({ sort: 'tvl' }), false)).toBe(
      serializeFilters({ sort: 'tvl' })
    );
  });
});
