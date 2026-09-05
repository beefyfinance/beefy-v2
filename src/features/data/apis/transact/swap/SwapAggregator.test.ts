import { orderBy } from 'lodash-es';
import { describe, expect, it, vi } from 'vitest';
import { isTokenEqual, isTokenNative, type TokenEntity } from '../../../entities/token.ts';
import type { BeefyState } from '../../../store/types.ts';
import { mergeTokenLists } from '../helpers/tokens.ts';
import type { ISwapProvider } from './ISwapProvider.ts';
import { SwapAggregator } from './SwapAggregator.ts';

const CHAIN = 'base';

function erc20(address: string): TokenEntity {
  return {
    type: 'erc20',
    id: address,
    chainId: CHAIN,
    address,
    oracleId: address,
    decimals: 18,
    symbol: address,
    providerId: undefined,
    buyUrl: undefined,
    website: undefined,
    description: undefined,
    documentation: undefined,
    tags: [],
  } as TokenEntity;
}

function fakeProvider(id: string, tokens: TokenEntity[]): ISwapProvider {
  return {
    getId: () => id,
    getSupportedTokens: async () => tokens,
    getSupportedChains: async () => [CHAIN],
    fetchQuote: async () => {
      throw new Error('not used');
    },
    fetchSwap: async () => {
      throw new Error('not used');
    },
  } as ISwapProvider;
}

function stateWithScores(scoreById: Record<string, number>): BeefyState {
  return {
    entities: { zaps: { tokens: { byChainId: { [CHAIN]: { scoreById } } } } },
  } as unknown as BeefyState;
}

/** the original fetchTokenSupport body, kept as the behavioural oracle */
function referenceTokenSupport(
  tokensPerProvider: TokenEntity[][],
  wantedTokens: TokenEntity[],
  state: BeefyState
) {
  const mergeAndSort = (lists: TokenEntity[][]) =>
    orderBy(
      mergeTokenLists(...lists),
      [
        token => (isTokenNative(token) ? 1 : 0),
        token => state.entities.zaps.tokens.byChainId[CHAIN]?.scoreById[token.id] || 0,
        token => token.symbol.toLowerCase(),
      ],
      ['desc', 'desc', 'asc']
    );
  const supporting = (filterFn: (tokens: TokenEntity[]) => boolean) =>
    mergeAndSort(tokensPerProvider.filter(pt => pt.length > 1 && filterFn(pt)));

  const tokens = wantedTokens.map(wanted =>
    supporting(pt => pt.some(providerToken => isTokenEqual(providerToken, wanted)))
  );
  if (tokens.length === 1) {
    return { tokens, any: tokens[0] };
  }
  return {
    tokens,
    any: supporting(pt => wantedTokens.some(w => pt.some(t => isTokenEqual(t, w)))),
  };
}

describe('SwapAggregator.fetchTokenSupport', () => {
  const [a, b, c, d, e] = ['0xA', '0xB', '0xC', '0xD', '0xE'].map(erc20);
  const state = stateWithScores({ '0xA': 5, '0xC': 2 });

  const providerTokens: TokenEntity[][] = [
    [a, b, c],
    [b, c, d],
    [a, d, e],
    [e], // length 1, must always be excluded
  ];
  const aggregator = new SwapAggregator(
    providerTokens.map((tokens, i) => fakeProvider(`p${i}`, tokens))
  );

  it('matches the reference implementation for a multi-token request', async () => {
    const wanted = [a, d];
    const actual = await aggregator.fetchTokenSupport(wanted, undefined, CHAIN, state);
    expect(actual).toEqual(referenceTokenSupport(providerTokens, wanted, state));
  });

  it('matches the reference implementation for a single-token request', async () => {
    const wanted = [c];
    const actual = await aggregator.fetchTokenSupport(wanted, undefined, CHAIN, state);
    expect(actual).toEqual(referenceTokenSupport(providerTokens, wanted, state));
    // single wanted token short-circuits: `any` is that token's list
    expect(actual.any).toBe(actual.tokens[0]);
  });

  it('matches the reference implementation across every wanted-token subset', async () => {
    const pool = [a, b, c, d, e];
    for (let mask = 1; mask < 1 << pool.length; ++mask) {
      const wanted = pool.filter((_, i) => mask & (1 << i));
      const actual = await aggregator.fetchTokenSupport(wanted, undefined, CHAIN, state);
      expect(actual).toEqual(referenceTokenSupport(providerTokens, wanted, state));
    }
  });

  it('excludes providers with a single supported token', async () => {
    const lonely = erc20('0xF');
    const withLonelyProvider = new SwapAggregator([
      fakeProvider('p0', [a, b, c]),
      fakeProvider('lonely', [lonely]),
    ]);

    // 0xF is only offered by a provider that supports one token, so nothing can route to it
    const { any } = await withLonelyProvider.fetchTokenSupport([lonely], undefined, CHAIN, state);
    expect(any).toEqual([]);

    // a is offered by a real provider, which contributes that provider's whole list
    const forA = await withLonelyProvider.fetchTokenSupport([a], undefined, CHAIN, state);
    expect(forA.any.map(t => t.address).sort()).toEqual(['0xA', '0xB', '0xC']);
  });

  it('merges and sorts each distinct provider subset only once', async () => {
    const spy = vi.spyOn(
      SwapAggregator.prototype as unknown as {
        mergeAndSortTokens: (tokens: TokenEntity[][], state: BeefyState) => TokenEntity[];
      },
      'mergeAndSortTokens'
    );

    // a, b and c each resolve to a different provider subset; d repeats b's subset {1,2}...
    // whatever the subsets are, the call count must equal the number of DISTINCT ones.
    const wanted = [a, b, c, d, e];
    await aggregator.fetchTokenSupport(wanted, undefined, CHAIN, state);

    const subsetOf = (w: TokenEntity) =>
      providerTokens
        .map((pt, i) => (pt.length > 1 && pt.some(t => isTokenEqual(t, w)) ? i : -1))
        .filter(i => i >= 0)
        .join(',');
    const anySubset = providerTokens
      .map((pt, i) =>
        pt.length > 1 && wanted.some(w => pt.some(t => isTokenEqual(t, w))) ? i : -1
      )
      .filter(i => i >= 0)
      .join(',');
    const distinct = new Set([...wanted.map(subsetOf), anySubset]);

    expect(spy).toHaveBeenCalledTimes(distinct.size);
    expect(spy.mock.calls.length).toBeLessThan(wanted.length + 1);
    spy.mockRestore();
  });
});
