import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectVaultMatchesText } from './filtered-vaults.ts';
import { selectVaultTokenNameWords } from './tokens.ts';

function makeState(): BeefyState {
  const tokens = {
    AAPLrh: { id: 'AAPLrh', symbol: 'AAPL', name: 'Apple • Robinhood Token', tags: ['STOCK'] },
    COINrh: { id: 'COINrh', symbol: 'COIN', name: 'Coinbase • Robinhood Token', tags: ['STOCK'] },
    USDG: { id: 'USDG', symbol: 'USDG', name: 'Global Dollar', tags: ['STABLECOIN'] },
    WETH: { id: 'WETH', symbol: 'WETH', name: 'Wrapped Ether', tags: [] },
  };
  const vaults = {
    'aapl-usdg': { name: 'AAPL-USDG', assetIds: ['AAPLrh', 'USDG'] },
    'coin-weth': { name: 'COIN-WETH', assetIds: ['COINrh', 'WETH'] },
    'weth-usdg': { name: 'WETH-USDG', assetIds: ['WETH', 'MISSING'] },
  };
  return {
    entities: {
      vaults: {
        byId: Object.fromEntries(
          Object.entries(vaults).map(([id, v]) => [
            id,
            { id, chainId: 'robinhood', names: { list: v.name }, assetIds: v.assetIds },
          ])
        ),
      },
      tokens: {
        byChainId: {
          robinhood: {
            byId: Object.fromEntries(Object.keys(tokens).map(id => [id, id.toLowerCase()])),
            byAddress: Object.fromEntries(
              Object.entries(tokens).map(([id, token]) => [id.toLowerCase(), token])
            ),
          },
        },
      },
    },
  } as unknown as BeefyState;
}

describe('selectVaultTokenNameWords', () => {
  it('returns company words for stock tokens only; issuer suffix and missing tokens are ignored', () => {
    const state = makeState();
    expect(selectVaultTokenNameWords(state, 'aapl-usdg')).toEqual(['apple']);
    expect(selectVaultTokenNameWords(state, 'weth-usdg')).toEqual([]);
  });
});

describe('selectVaultMatchesText (dashboard / deposit-from-vault list)', () => {
  const state = makeState();
  const vault = (id: string) => state.entities.vaults.byId[id]!;

  it('matches company names whole or by prefix, and still matches tickers', () => {
    expect(selectVaultMatchesText(state, vault('aapl-usdg'), 'apple')).toBe(true);
    expect(selectVaultMatchesText(state, vault('aapl-usdg'), 'appl')).toBe(true);
    expect(selectVaultMatchesText(state, vault('aapl-usdg'), 'apple usdg')).toBe(true);
    expect(selectVaultMatchesText(state, vault('aapl-usdg'), 'aapl')).toBe(true);
    expect(selectVaultMatchesText(state, vault('aapl-usdg'), 'nvidia')).toBe(false);
  });

  it('never matches a name word by substring', () => {
    expect(selectVaultMatchesText(state, vault('coin-weth'), 'base')).toBe(false);
    expect(selectVaultMatchesText(state, vault('coin-weth'), 'coinbase')).toBe(true);
  });
});
