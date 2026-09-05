import { uniqBy } from 'lodash-es';
import { describe, expect, it } from 'vitest';
import { isTokenEqual, type TokenEntity } from '../../../entities/token.ts';
import { tokensReachableFromAll, uniqueTokens } from './tokens.ts';

function erc20(chainId: string, address: string): TokenEntity {
  return {
    type: 'erc20',
    id: `${chainId}-${address}`,
    chainId,
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

function native(chainId: string, address: string): TokenEntity {
  return {
    type: 'native',
    id: `${chainId}-native`,
    chainId,
    address,
    oracleId: 'native',
    decimals: 18,
    symbol: 'NATIVE',
    buyUrl: undefined,
    website: undefined,
    description: undefined,
    documentation: undefined,
    tags: [],
  } as TokenEntity;
}

/** the scan this helper replaces, kept here as the behavioural oracle */
function reachableByScan(
  candidates: TokenEntity[],
  wantedTokens: TokenEntity[],
  supportedPerWanted: TokenEntity[][]
): TokenEntity[] {
  return candidates.filter(candidate =>
    wantedTokens.every(
      (wanted, i) =>
        isTokenEqual(candidate, wanted) ||
        supportedPerWanted[i].some(supported => isTokenEqual(supported, candidate))
    )
  );
}

describe('uniqueTokens', () => {
  const a = erc20('base', '0xAAA');
  const b = erc20('base', '0xBBB');

  /** the lodash call this replaced, kept here as the behavioural oracle */
  const byUniqBy = (tokens: TokenEntity[]) =>
    uniqBy(tokens, token => `${token.chainId}-${token.address.toLowerCase()}`);

  it('keeps the first occurrence and preserves order', () => {
    const aAgain = erc20('base', '0xAAA');
    const result = uniqueTokens([a, b, aAgain]);
    expect(result).toEqual([a, b]);
    // the FIRST instance survives, not a later duplicate
    expect(result[0]).toBe(a);
  });

  it('dedupes across address casing but not across chains', () => {
    const lowerA = erc20('base', '0xaaa');
    const otherChainA = erc20('bsc', '0xAAA');
    expect(uniqueTokens([a, lowerA])).toEqual([a]);
    expect(uniqueTokens([a, otherChainA])).toEqual([a, otherChainA]);
  });

  it('handles an empty list', () => {
    expect(uniqueTokens([])).toEqual([]);
  });

  it('matches lodash uniqBy on a list with many duplicates', () => {
    const pool = ['0xAAA', '0xaaa', '0xBBB', '0xCCC', '0xbbb'].map(addr => erc20('base', addr));
    const many = Array.from({ length: 250 }, (_, i) => pool[i % pool.length]);
    // >200 entries takes lodash's SetCache path, so this pins the fast path too
    expect(uniqueTokens(many)).toEqual(byUniqBy(many));
  });
});

describe('tokensReachableFromAll', () => {
  const a = erc20('base', '0xAAA');
  const b = erc20('base', '0xBBB');
  const c = erc20('base', '0xCCC');
  const d = erc20('base', '0xDDD');

  it('keeps only candidates every wanted token can reach', () => {
    const candidates = [a, b, c, d];
    const wanted = [a, b];
    const supported = [
      [b, c],
      [a, c],
    ];
    // a: === wanted[0], and in supported[1] -> keep
    // b: in supported[0], === wanted[1] -> keep
    // c: in both -> keep
    // d: in neither -> drop
    expect(tokensReachableFromAll(candidates, wanted, supported)).toEqual([a, b, c]);
  });

  it('drops a candidate that only one wanted token can reach', () => {
    expect(tokensReachableFromAll([d], [a, b], [[d], []])).toEqual([]);
  });

  it('keeps every candidate when there are no wanted tokens', () => {
    expect(tokensReachableFromAll([a, b], [], [])).toEqual([a, b]);
  });

  it('preserves candidate order and does not dedupe', () => {
    expect(tokensReachableFromAll([c, a, c], [a], [[a, c]])).toEqual([c, a, c]);
  });

  it('distinguishes tokens that differ only by type', () => {
    const nativeA = native('base', '0xAAA');
    // same chainId+address as `a`, different type -> isTokenEqual is false
    expect(tokensReachableFromAll([nativeA], [a], [[a]])).toEqual([]);
    expect(tokensReachableFromAll([nativeA], [nativeA], [[]])).toEqual([nativeA]);
  });

  it('distinguishes tokens that differ only by chain', () => {
    const otherChainA = erc20('bsc', '0xAAA');
    expect(tokensReachableFromAll([otherChainA], [a], [[a]])).toEqual([]);
  });

  it('treats addresses as case-sensitive, matching isTokenEqual', () => {
    const lowerA = erc20('base', '0xaaa');
    expect(tokensReachableFromAll([lowerA], [a], [[a]])).toEqual([]);
  });

  it('matches the scan it replaces across generated cases', () => {
    const pool = [a, b, c, d, native('base', '0xEEE'), erc20('bsc', '0xAAA')];
    for (let mask = 0; mask < 1 << pool.length; ++mask) {
      const wanted = pool.filter((_, i) => mask & (1 << i));
      const supported = wanted.map((_, i) => pool.filter((_, j) => (i + j) % 3 !== 0));
      expect(tokensReachableFromAll(pool, wanted, supported)).toEqual(
        reachableByScan(pool, wanted, supported)
      );
    }
  });
});
