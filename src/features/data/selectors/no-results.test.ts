import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { FilterContent, type FilterValues } from '../reducers/filtered-vaults-types.ts';
import type { BeefyState } from '../store/types.ts';
import { FILTER_DEFAULTS } from '../utils/filter-values.ts';
import {
  clearBlockerCategories,
  listActiveBlockerCategories,
  selectSearchNoResultsInfo,
} from './no-results.ts';

function makeFilters(overrides: Partial<FilterValues> = {}): FilterValues {
  return {
    ...FILTER_DEFAULTS,
    searchText: 'cbbtc',
    ...overrides,
  };
}

describe('listActiveBlockerCategories', () => {
  it('returns nothing when no user filters are active', () => {
    expect(listActiveBlockerCategories(makeFilters())).toEqual([]);
  });

  it('detects each category', () => {
    expect(listActiveBlockerCategories(makeFilters({ chainIds: ['ethereum'] }))).toEqual(['chain']);
    expect(listActiveBlockerCategories(makeFilters({ platformIds: ['curve'] }))).toEqual([
      'platform',
    ]);
    expect(listActiveBlockerCategories(makeFilters({ vaultCategory: ['stable'] }))).toEqual([
      'category',
    ]);
    expect(listActiveBlockerCategories(makeFilters({ assetType: ['clm'] }))).toEqual(['type']);
    expect(listActiveBlockerCategories(makeFilters({ strategyType: 'pools' }))).toEqual([
      'product',
    ]);
    expect(listActiveBlockerCategories(makeFilters({ onlyBoosted: true }))).toEqual(['flags']);
    expect(
      listActiveBlockerCategories(makeFilters({ minimumUnderlyingTvl: new BigNumber(1000) }))
    ).toEqual(['mintvl']);
    expect(listActiveBlockerCategories(makeFilters({ userCategory: 'deposited' }))).toEqual([
      'userCategory',
    ]);
  });

  it('lists multiple active categories', () => {
    const filters = makeFilters({ chainIds: ['base'], onlyBoosted: true, strategyType: 'vaults' });
    expect(listActiveBlockerCategories(filters)).toEqual(['chain', 'product', 'flags']);
  });
});

describe('clearBlockerCategories', () => {
  it('clears exactly the given categories and nothing else', () => {
    const filters = makeFilters({
      chainIds: ['base'],
      platformIds: ['curve'],
      onlyBoosted: true,
      userCategory: 'deposited',
      minimumUnderlyingTvl: new BigNumber(1000),
    });
    const cleared = clearBlockerCategories(filters, ['chain', 'flags']);
    expect(cleared.chainIds).toEqual([]);
    expect(cleared.onlyBoosted).toBe(false);
    expect(cleared.platformIds).toEqual(['curve']);
    expect(cleared.userCategory).toBe('deposited');
    expect(cleared.minimumUnderlyingTvl.eq(1000)).toBe(true);
    expect(cleared.searchText).toBe('cbbtc');
    expect(filters.chainIds).toEqual(['base']); // input untouched
  });

  it('clearing all categories yields a search-only filter set', () => {
    const filters = makeFilters({
      chainIds: ['base'],
      platformIds: ['curve'],
      vaultCategory: ['meme'],
      assetType: ['lps'],
      strategyType: 'pools',
      onlyRetired: true,
      onlyUnstakedClm: true,
      userCategory: 'deposited',
      minimumUnderlyingTvl: new BigNumber(5),
    });
    const cleared = clearBlockerCategories(filters, [
      'chain',
      'platform',
      'category',
      'type',
      'product',
      'flags',
      'mintvl',
      'userCategory',
    ]);
    expect(listActiveBlockerCategories(cleared)).toEqual([]);
    expect(cleared.searchText).toBe('cbbtc');
  });
});

type FixtureVault = {
  id: string;
  name: string;
  assets: string[];
  chainId: string;
  platformId: string;
  status?: 'active' | 'eol' | 'paused';
  contractAddress?: string;
};

/** addressbook-derived tokens, keyed by asset id; only the search dictionary reads these */
type FixtureToken = { symbol: string; name?: string; tags?: string[] };

function makeTokensByChainId(chainId: string, tokens: Record<string, FixtureToken>) {
  return {
    [chainId]: {
      byId: Object.fromEntries(Object.keys(tokens).map(id => [id, id.toLowerCase()])),
      byAddress: Object.fromEntries(
        Object.entries(tokens).map(([id, token]) => [id.toLowerCase(), { id, tags: [], ...token }])
      ),
    },
  };
}

// minimal state satisfying every selector the diagnosis predicate touches for these filters
function makeState(
  vaults: FixtureVault[],
  filters: FilterValues,
  tokensByChainId: object = {},
  /** configured in platforms.json but backing no vault, like a defunct protocol */
  unusedPlatformIds: string[] = []
): BeefyState {
  const chainIds = [...new Set([...vaults.map(v => v.chainId), ...filters.chainIds])];
  const usedPlatformIds = [...new Set(vaults.map(v => v.platformId))];
  const allPlatformIds = [...new Set([...usedPlatformIds, ...unusedPlatformIds])];
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    entities: {
      vaults: {
        byId: Object.fromEntries(
          vaults.map(v => [
            v.id,
            {
              id: v.id,
              type: 'standard',
              subType: 'standard',
              status: v.status ?? 'active',
              names: { list: v.name },
              assetIds: v.assets,
              chainId: v.chainId,
              platformId: v.platformId,
              assetType: 'lps',
              contractAddress: v.contractAddress ?? '0x1111111111111111111111111111111111111111',
              depositTokenAddress: '0x2222222222222222222222222222222222222222',
              receiptTokenAddress: '0x3333333333333333333333333333333333333333',
            },
          ])
        ),
        allVisibleIds: vaults.map(v => v.id),
        contractData: { byVaultId: {} },
      },
      chains: {
        byId: Object.fromEntries(chainIds.map(id => [id, { id, name: capitalize(id) }])),
        allIds: chainIds,
        activeIds: chainIds,
        eolIds: [],
      },
      platforms: {
        byId: Object.fromEntries(allPlatformIds.map(id => [id, { id, name: capitalize(id) }])),
        allIds: allPlatformIds,
        activeIds: usedPlatformIds,
        usedIds: usedPlatformIds,
      },
      tokens: {
        byChainId: tokensByChainId,
      },
    },
    ui: {
      filteredVaults: {
        pending: filters,
        applied: filters,
        sortPickedDuringSearch: false,
        filteredVaultIds: [],
        sortedFilteredVaultIds: [],
        searchRanked: false,
        filterContent: FilterContent.Filter,
      },
    },
  } as unknown as BeefyState;
}

const FIXTURE_VAULTS: FixtureVault[] = [
  {
    id: 'aero-usdc',
    name: 'USDC Vault',
    assets: ['USDC'],
    chainId: 'base',
    platformId: 'aerodrome',
  },
  {
    id: 'aave-usdc-weth',
    name: 'USDC-WETH',
    assets: ['USDC', 'WETH'],
    chainId: 'ethereum',
    platformId: 'aave',
    contractAddress: '0xaaaa111111111111111111111111111111111111',
  },
  {
    id: 'aero-caps',
    name: 'CAPS Vault',
    assets: ['CAPS'],
    chainId: 'base',
    platformId: 'aerodrome',
    status: 'eol',
  },
];

describe('selectSearchNoResultsInfo', () => {
  it('diagnoses the single blocking filter with an honest show count', () => {
    // chain filter hides both USDC vaults; the platform filter would still hide one of them
    const filters = makeFilters({
      searchText: 'usdc',
      chainIds: ['polygon'],
      platformIds: ['aave'],
    });
    const info = selectSearchNoResultsInfo(makeState(FIXTURE_VAULTS, filters));
    expect(info).toEqual({
      kind: 'blocked',
      blockers: ['chain'],
      showCount: 1,
    });
  });

  it('falls back to all active categories on joint blockage', () => {
    // no single filter removal yields results: chain excludes all, platform matches none
    const filters = makeFilters({
      searchText: 'usdc',
      chainIds: ['polygon'],
      platformIds: ['curve'],
    });
    const info = selectSearchNoResultsInfo(makeState(FIXTURE_VAULTS, filters));
    expect(info.kind).toBe('blocked');
    if (info.kind === 'blocked') {
      expect(info.blockers).toEqual(['chain', 'platform']);
      expect(info.showCount).toBe(2);
    }
  });

  it('detects matches that only exist on retired vaults', () => {
    const filters = makeFilters({ searchText: 'caps' });
    const info = selectSearchNoResultsInfo(makeState(FIXTURE_VAULTS, filters));
    expect(info).toEqual({ kind: 'retired', count: 1 });
  });

  it('suggests near-miss words when nothing matches anywhere', () => {
    const filters = makeFilters({ searchText: 'usdvc' });
    const info = selectSearchNoResultsInfo(makeState(FIXTURE_VAULTS, filters));
    expect(info.kind).toBe('suggestions');
    if (info.kind === 'suggestions') {
      expect(info.suggestions).toContain('USDC');
    }
  });

  it('suggests searchable symbols and company names, never the unsearchable asset id', () => {
    // AAPLrh is the config asset id; only AAPL (symbol) and Apple (company) actually find the vault
    const stockVaults: FixtureVault[] = [
      {
        id: 'uni-aapl-usdg',
        name: 'AAPL-USDG',
        assets: ['AAPLrh', 'USDG'],
        chainId: 'robinhood',
        platformId: 'uniswap',
      },
    ];
    const tokens = makeTokensByChainId('robinhood', {
      AAPLrh: { symbol: 'AAPL', name: 'Apple • Robinhood Token', tags: ['STOCK'] },
      USDG: { symbol: 'USDG', name: 'Global Dollar', tags: ['STABLECOIN'] },
    });
    const suggestionsFor = (searchText: string) => {
      const filters = makeFilters({ searchText });
      const info = selectSearchNoResultsInfo(makeState(stockVaults, filters, tokens));
      return info.kind === 'suggestions' ? info.suggestions : [];
    };

    // "aaplr" is 1 edit from the asset id and 1 from the symbol: the symbol must win
    expect(suggestionsFor('aaplr')).toContain('AAPL');
    expect(suggestionsFor('aaplr')).not.toContain('AAPLrh');
    // company names are suggestable, with their original casing, and the issuer suffix is not
    expect(suggestionsFor('aple')).toContain('Apple');
    expect(suggestionsFor('robinhod')).not.toContain('Robinhood Token');
  });

  it('suggests platforms that back a vault, never ones configured but unused', () => {
    // a suggestion replaces the query, so a platform no vault uses is a dead end when clicked
    const suggestionsFor = (searchText: string) => {
      const filters = makeFilters({ searchText });
      const info = selectSearchNoResultsInfo(makeState(FIXTURE_VAULTS, filters, {}, ['snowball']));
      return info.kind === 'suggestions' ? info.suggestions : [];
    };

    // "aerodrone" is 1 edit from Aerodrome and does not prefix-match it, so it finds nothing
    expect(suggestionsFor('aerodrone')).toContain('Aerodrome');
    expect(suggestionsFor('snowbal')).not.toContain('Snowball');
  });

  it('classifies partial and unmatched addresses', () => {
    expect(
      selectSearchNoResultsInfo(makeState(FIXTURE_VAULTS, makeFilters({ searchText: '0xab' })))
    ).toEqual({ kind: 'address-too-short' });
    expect(
      selectSearchNoResultsInfo(
        makeState(FIXTURE_VAULTS, makeFilters({ searchText: '0xdeadbeef' }))
      )
    ).toEqual({ kind: 'address-no-match' });
  });

  it('does not throw when a blocking chain id is missing from byId (disabled chain via url)', () => {
    const filters = makeFilters({ searchText: 'usdc', chainIds: ['polygon'] });
    const state = makeState(FIXTURE_VAULTS, filters);
    // simulate a disabled chain: present in chainIds but absent from entities.chains.byId
    delete (state.entities.chains.byId as Record<string, unknown>).polygon;
    const info = selectSearchNoResultsInfo(state);
    expect(info.kind).toBe('blocked');
    if (info.kind === 'blocked') {
      // falls back to the raw id instead of crashing
      expect(info.blockers).toEqual(['chain']);
    }
  });

  it('prefers the blocked diagnosis for address matches hidden by filters', () => {
    const filters = makeFilters({ searchText: '0xaaaa11', chainIds: ['polygon'] });
    const info = selectSearchNoResultsInfo(makeState(FIXTURE_VAULTS, filters));
    expect(info.kind).toBe('blocked');
    if (info.kind === 'blocked') {
      expect(info.showCount).toBe(1);
    }
  });
});
