import { describe, expect, it } from 'vitest';
import type { VaultEntity } from '../entities/vault.ts';
import {
  buildVaultSearchContext,
  classifySearchQuery,
  hasSearchText,
  scoreVaultForSearch,
  type SearchIndexEntry,
  toSearchWords,
  type VaultSearchContext,
  type VaultSearchTarget,
} from './vault-search.ts';

const chainIndex: SearchIndexEntry[] = [
  { id: 'ethereum', texts: ['ethereum'] },
  { id: 'base', texts: ['base'] },
  { id: 'bsc', texts: ['bsc', 'bnb', 'chain'] },
];

const platformIndex: SearchIndexEntry[] = [
  { id: 'aerodrome', texts: ['aerodrome'] },
  { id: 'curve', texts: ['curve'] },
  { id: 'baseswap', texts: ['baseswap'] },
];

function makeVault(overrides: {
  id?: string;
  name?: string;
  chainId?: string;
  type?: string;
  contractAddress?: string;
  depositTokenAddress?: string;
  receiptTokenAddress?: string;
}): VaultEntity {
  return {
    id: overrides.id ?? 'test-vault',
    type: overrides.type ?? 'standard',
    subType: 'standard',
    names: { list: overrides.name ?? 'Test Vault' },
    chainId: overrides.chainId ?? 'ethereum',
    contractAddress: overrides.contractAddress ?? '0x1111111111111111111111111111111111111111',
    depositTokenAddress:
      overrides.depositTokenAddress ?? '0x2222222222222222222222222222222222222222',
    receiptTokenAddress:
      overrides.receiptTokenAddress ?? '0x3333333333333333333333333333333333333333',
  } as unknown as VaultEntity;
}

/** a vault with no token/platform/strategy data, so each test names only the fields it exercises */
function target(
  vault: VaultEntity,
  overrides: Partial<Omit<VaultSearchTarget, 'vault'>> = {}
): VaultSearchTarget {
  return { vault, tokenSymbols: [], tokenNameWords: [], platformIds: [], ...overrides };
}

function context(query: string): VaultSearchContext {
  const built = buildVaultSearchContext(query, chainIndex, platformIndex);
  if (!built) {
    throw new Error(`expected context for "${query}"`);
  }
  return built;
}

describe('hasSearchText', () => {
  it('is false for empty, whitespace-only and hyphen-only queries', () => {
    expect(hasSearchText('')).toBe(false);
    expect(hasSearchText('   ')).toBe(false);
    expect(hasSearchText('--')).toBe(false);
  });

  it('is true for real queries', () => {
    expect(hasSearchText('eth')).toBe(true);
  });
});

describe('classifySearchQuery', () => {
  it('detects addresses with 6+ hex chars', () => {
    expect(classifySearchQuery('0xabc123')).toBe('address');
    expect(classifySearchQuery(' 0xAbC1234567 ')).toBe('address');
  });

  it('detects too-short address prefixes', () => {
    expect(classifySearchQuery('0x')).toBe('address-too-short');
    expect(classifySearchQuery('0xabc12')).toBe('address-too-short');
  });

  it('treats everything else as text', () => {
    expect(classifySearchQuery('usdc')).toBe('text');
    expect(classifySearchQuery('0xabc xyz')).toBe('text'); // multi-word never address mode
    expect(classifySearchQuery('0xzz1234')).toBe('text'); // non-hex
  });
});

describe('buildVaultSearchContext', () => {
  it('returns undefined for empty queries', () => {
    expect(buildVaultSearchContext('', chainIndex, platformIndex)).toBeUndefined();
    expect(buildVaultSearchContext('  -  ', chainIndex, platformIndex)).toBeUndefined();
  });

  it('drops words of length 1 like the old matcher', () => {
    expect(context('a usdc').words.map(w => w.word)).toEqual(['usdc']);
  });

  it('splits on space, slash and comma; hyphens are simplified to spaces', () => {
    expect(context('cbeth-eth/usdc,dai').words.map(w => w.word)).toEqual([
      'cbeth',
      'eth',
      'usdc',
      'dai',
    ]);
  });

  it('toSearchWords tokenizes token names the same way as queries', () => {
    expect(toSearchWords('Apple • Robinhood Token')).toEqual(['apple', 'robinhood', 'token']);
    expect(toSearchWords('SPDR S&P 500 ETF Trust')).toEqual(['spdr', 's&p', '500', 'etf', 'trust']);
    expect(toSearchWords('Strategy Inc.')).toEqual(['strategy', 'inc.']);
    expect(toSearchWords('up')).toEqual(['up']);
    expect(toSearchWords('B')).toEqual([]);
  });

  it('resolves chain words exactly and platform words by 3+ char prefix', () => {
    const [word] = context('base').words;
    expect([...word.chainIds]).toEqual(['base']);
    expect([...word.platformIds]).toEqual(['baseswap']);
    const [aero] = context('aero').words;
    expect([...aero.chainIds]).toEqual([]);
    expect([...aero.platformIds]).toEqual(['aerodrome']);
  });

  it('does not prefix-match chains', () => {
    const [word] = context('ether').words;
    expect(word.chainIds.size).toBe(0);
  });

  it('flags anyPlatformWords only when a word matched a platform', () => {
    expect(context('aero').anyPlatformWords).toBe(true);
    expect(context('ethereum').anyPlatformWords).toBe(false);
  });
});

describe('scoreVaultForSearch tiers', () => {
  const vault = makeVault({ name: 'cbBTC-USDC', chainId: 'base', id: 'aero-cbbtc-usdc' });

  it('100: exact name', () => {
    expect(scoreVaultForSearch(context('cbbtc usdc'), target(vault))).toBe(100);
  });

  it('90: name prefix', () => {
    expect(scoreVaultForSearch(context('cbbtc us'), target(vault))).toBe(90);
  });

  it('80: phrase in name', () => {
    expect(scoreVaultForSearch(context('btc usdc'), target(vault))).toBe(80);
  });

  it('70: every word in name', () => {
    expect(scoreVaultForSearch(context('usdc cbbtc extra'), target(vault))).toBe(0);
    expect(scoreVaultForSearch(context('usdc cbbtc'), target(vault))).toBe(70); // reversed word order
    const other = makeVault({ name: 'USDC-DAI cbBTC Pool' });
    expect(scoreVaultForSearch(context('usdc pool'), target(other))).toBe(70);
  });

  it('60: fuzzy token symbol (wrapped-token aware)', () => {
    const single = makeVault({ name: 'Alpha Pool' });
    const score = (query: string, tokenSymbols: string[]) =>
      scoreVaultForSearch(context(query), target(single, { tokenSymbols }));
    expect(score('eth', ['WETH'])).toBe(60);
    expect(score('eth', ['ETH'])).toBe(60);
    expect(score('weth', ['WETH'])).toBe(60);
    expect(score('steth', ['wstETH'])).toBe(60); // w-prefix fuzzy
    // wrapping is query-side only (parity with the old matcher): weth does not find plain ETH
    expect(score('weth', ['ETH'])).toBe(0);
  });

  it('50: token substring', () => {
    const single = makeVault({ name: 'Alpha Pool' });
    expect(scoreVaultForSearch(context('usd'), target(single, { tokenSymbols: ['USDC'] }))).toBe(
      50
    );
  });

  it('60/50: stock name words match whole (60) or by 3+ char prefix (50), never by substring', () => {
    // as produced by selectVaultTokenNameWords for AAPL-USDG / SPY-USDG / COIN-WETH
    const apple = target(makeVault({ name: 'AAPL-USDG' }), {
      tokenSymbols: ['AAPL', 'USDG'],
      tokenNameWords: toSearchWords('Apple'),
    });
    expect(scoreVaultForSearch(context('apple'), apple)).toBe(60);
    expect(scoreVaultForSearch(context('appl'), apple)).toBe(50);
    expect(scoreVaultForSearch(context('ro'), apple)).toBe(0);
    expect(scoreVaultForSearch(context('apple usdg'), apple)).toBe(60);
    expect(scoreVaultForSearch(context('nvidia'), apple)).toBe(0);

    const spy = target(makeVault({ name: 'SPY-USDG' }), {
      tokenSymbols: ['SPY', 'USDG'],
      tokenNameWords: toSearchWords('SPDR S&P 500 ETF Trust'),
    });
    expect(scoreVaultForSearch(context('s&p 500'), spy)).toBe(60);
    expect(scoreVaultForSearch(context('spdr'), spy)).toBe(60);

    // "base" must not surface Coinbase above Base-chain vaults
    const coin = target(makeVault({ name: 'COIN-WETH', chainId: 'robinhood' }), {
      tokenSymbols: ['COIN', 'WETH'],
      tokenNameWords: toSearchWords('Coinbase'),
    });
    expect(scoreVaultForSearch(context('base'), coin)).toBe(0);
  });

  it('40: platform match', () => {
    const single = makeVault({ name: 'Something Else' });
    expect(
      scoreVaultForSearch(context('aero'), target(single, { platformIds: ['aerodrome'] }))
    ).toBe(40);
  });

  it('30: chain match, exact whole word only', () => {
    const single = makeVault({ name: 'Something Else', chainId: 'base' });
    expect(scoreVaultForSearch(context('base'), target(single))).toBe(30);
  });

  it('20: vault id substring for words of 4+ chars', () => {
    const single = makeVault({ name: 'Something Else', id: 'moo-gamma-pool' });
    expect(scoreVaultForSearch(context('gamma'), target(single))).toBe(20);
    const short = makeVault({ name: 'Something Else', id: 'moo-gam' });
    expect(scoreVaultForSearch(context('gam'), target(short))).toBe(0);
  });

  it('0: any word without a match rejects the vault', () => {
    const single = makeVault({ name: 'Something Else', chainId: 'base' });
    expect(scoreVaultForSearch(context('base zzz'), target(single))).toBe(0);
  });

  it('multi-word score is the minimum tier across words', () => {
    // "usdc" hits token (60), "base" hits chain (30) -> 30
    const vaultOnBase = makeVault({ name: 'Something Else', chainId: 'base' });
    expect(
      scoreVaultForSearch(context('usdc base'), target(vaultOnBase, { tokenSymbols: ['USDC'] }))
    ).toBe(30);
  });

  it('DIVERGENCE vs old matcher: 1-char queries match name substrings, not everything', () => {
    // old matcher vacuously matched ALL vaults for 1-char queries (empty word list)
    const vault = makeVault({ name: 'cbBTC-USDC' });
    expect(scoreVaultForSearch(context('b'), target(vault))).toBe(80); // phrase-in-name
    const noMatch = makeVault({ name: 'XYZ Pool' });
    expect(scoreVaultForSearch(context('b'), target(noMatch))).toBe(0);
  });

  it('DIVERGENCE vs old matcher: per-word token substrings match multi-word queries', () => {
    // old matcher required whole-query substring per symbol; per-word is intended behavior now
    const single = makeVault({ name: 'Something Else' });
    expect(
      scoreVaultForSearch(
        context('steth btcb'),
        target(single, { tokenSymbols: ['wstETH', 'aBTCb'] })
      )
    ).toBe(50);
  });

  it('regexes are not stateful across vaults (no g flag)', () => {
    const ctx = context('eth');
    const a = makeVault({ name: 'A' });
    const b = makeVault({ name: 'B' });
    expect(scoreVaultForSearch(ctx, target(a, { tokenSymbols: ['WETH'] }))).toBe(60);
    expect(scoreVaultForSearch(ctx, target(b, { tokenSymbols: ['WETH'] }))).toBe(60); // would fail with a g-flagged .test()
  });
});

describe('scoreVaultForSearch address mode', () => {
  const vault = makeVault({
    name: 'cbBTC-USDC',
    contractAddress: '0xAAAA567890123456789012345678901234567890',
    depositTokenAddress: '0xBBBB567890123456789012345678901234567890',
    receiptTokenAddress: '0xCCCC567890123456789012345678901234567890',
  });

  it('prefix-matches contract, deposit and receipt addresses case-insensitively', () => {
    expect(scoreVaultForSearch(context('0xaaaa56'), target(vault))).toBe(60);
    expect(scoreVaultForSearch(context('0xBBBB5678'), target(vault))).toBe(60);
    expect(scoreVaultForSearch(context('0xcccc56'), target(vault))).toBe(60);
  });

  it('ranks a full exact address match above prefix matches', () => {
    expect(
      scoreVaultForSearch(context('0xAAAA567890123456789012345678901234567890'), target(vault))
    ).toBe(100);
  });

  it('disables all text matching in address mode', () => {
    expect(
      scoreVaultForSearch(context('0xdddd56'), target(vault, { tokenSymbols: ['0XDDDD56'] }))
    ).toBe(0);
  });

  it('matches clm deposit token and underlying pool addresses on cowcentrated-like vaults', () => {
    const clm = {
      id: 'clm-vault',
      type: 'cowcentrated',
      subType: 'cowcentrated',
      names: { list: 'CLM Vault' },
      chainId: 'base',
      contractAddress: '0x1111111111111111111111111111111111111111',
      depositTokenAddress: '0x2222222222222222222222222222222222222222',
      depositTokenAddresses: ['0x3333333333333333333333333333333333333333'],
      receiptTokenAddress: '0x4444444444444444444444444444444444444444',
      poolAddress: '0x5555555555555555555555555555555555555555',
    } as unknown as VaultEntity;
    expect(scoreVaultForSearch(context('0x333333'), target(clm))).toBe(60); // clm deposit token
    expect(scoreVaultForSearch(context('0x555555'), target(clm))).toBe(60); // underlying pool
    // standard vaults have no pool address: same prefix must not match
    const standard = makeVault({ name: 'Alpha Pool' });
    expect(scoreVaultForSearch(context('0x555555'), target(standard))).toBe(0);
  });

  it('matches the strategy address when provided, only in address mode', () => {
    const strategy = '0xbb8815fa8006ea1c343ddb30962811a78ab5529d';
    expect(
      scoreVaultForSearch(context('0xbb8815'), target(vault, { strategyAddress: strategy }))
    ).toBe(60);
    expect(
      scoreVaultForSearch(context('0xbb8815'), target(vault, { strategyAddress: undefined }))
    ).toBe(0);
    expect(
      scoreVaultForSearch(context(strategy), target(vault, { strategyAddress: strategy }))
    ).toBe(100); // exact
  });

  it('does not read receipt address on gov-single vaults', () => {
    // gov single has no receiptTokenAddress; the guard must prevent reading it
    const gov = {
      id: 'gov-vault',
      type: 'gov',
      contractType: 'single',
      names: { list: 'Gov Vault' },
      chainId: 'ethereum',
      contractAddress: '0xAAAA567890123456789012345678901234567890',
      depositTokenAddress: '0x2222222222222222222222222222222222222222',
    } as unknown as VaultEntity;
    expect(scoreVaultForSearch(context('0xaaaa56'), target(gov))).toBe(60);
  });
});
