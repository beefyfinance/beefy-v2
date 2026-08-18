import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import {
  STABLES_ASSET_KEY,
  selectSimplifiedAssetIndex,
  selectSimplifiedAssetKeysByTvl,
  selectSimplifiedChainIdsByTvl,
  selectSimplifiedVaultIdsByTvl,
} from './simplified-vaults.ts';

type FakeVault = {
  id: string;
  chainId: string;
  assetType: 'single' | 'lps' | 'clm';
  assetIds: string[];
};

const STABLES = new Set(['USDC', 'USDT', 'arbUSDCe', 'USDT0', 'DAI']);
/** addressbook id -> display symbol, mirroring entries like MSTRrh -> MSTR */
const SYMBOLS: Record<string, string> = {
  MSTRrh: 'MSTR',
  arbUSDCe: 'USDCe',
  opUSDCe: 'USDCe',
};

function makeState(
  vaults: FakeVault[],
  tvl: Record<string, number>,
  filters?: { vaultCategory?: string[]; assetType?: string[] }
): BeefyState {
  // one fake chain token table: every asset id resolves to a token tagged if it is a stablecoin
  const byChainId: Record<string, unknown> = {};
  for (const v of vaults) {
    const entry = (byChainId[v.chainId] ??= { byId: {}, byAddress: {} }) as {
      byId: Record<string, string>;
      byAddress: Record<string, { symbol: string; tags: string[] }>;
    };
    for (const a of v.assetIds) {
      entry.byId[a] = a;
      entry.byAddress[a] = {
        symbol: SYMBOLS[a] ?? a,
        tags: STABLES.has(a) ? ['STABLECOIN'] : [],
      };
    }
  }

  return {
    entities: {
      vaults: {
        allActiveIds: vaults.map(v => v.id),
        byId: Object.fromEntries(vaults.map(v => [v.id, v])),
      },
      tokens: { byChainId },
    },
    biz: {
      tvl: {
        byVaultId: Object.fromEntries(
          Object.entries(tvl).map(([id, v]) => [id, { tvl: new BigNumber(v) }])
        ),
      },
    },
    ui: {
      filteredVaults: {
        pending: {
          vaultCategory: filters?.vaultCategory ?? [],
          assetType: filters?.assetType ?? [],
        },
      },
    },
  } as unknown as BeefyState;
}

const VAULTS: FakeVault[] = [
  { id: 'eth-gme-usdc', chainId: 'ethereum', assetType: 'lps', assetIds: ['GME', 'USDC'] },
  { id: 'eth-weth-gme', chainId: 'ethereum', assetType: 'lps', assetIds: ['WETH', 'GME'] },
  { id: 'eth-usdc-lend', chainId: 'ethereum', assetType: 'single', assetIds: ['USDC'] },
  { id: 'eth-usdc-usdt', chainId: 'ethereum', assetType: 'lps', assetIds: ['USDC', 'USDT'] },
  { id: 'arb-usdc-lend', chainId: 'arbitrum', assetType: 'single', assetIds: ['arbUSDCe'] },
  { id: 'base-weth-clm', chainId: 'base', assetType: 'clm', assetIds: ['WETH', 'USDC'] },
  { id: 'rh-mstr-weth', chainId: 'robinhood', assetType: 'lps', assetIds: ['MSTRrh', 'WETH'] },
];

const TVL = {
  'eth-gme-usdc': 500,
  'eth-weth-gme': 100,
  'eth-usdc-lend': 900,
  'eth-usdc-usdt': 300,
  'arb-usdc-lend': 5000,
  'base-weth-clm': 7000,
  'rh-mstr-weth': 50,
};

describe('simplified vaults selectors', () => {
  const state = makeState(VAULTS, TVL);

  it('lists a vault once, under the principal (first) asset', () => {
    const index = selectSimplifiedAssetIndex(state);
    // GME-USDC belongs to GME, not to the USDC it is quoted against
    expect(index.byAsset['GME']['ethereum']).toEqual(['eth-gme-usdc']);
    // WETH-GME is principal WETH, so GME does not pick it up
    expect(index.byAsset['WETH']['ethereum']).toEqual(['eth-weth-gme']);
  });

  it('groups on the display symbol, not the addressbook id', () => {
    // MSTRrh has no icon and is shown as MSTR everywhere else in the app
    const index = selectSimplifiedAssetIndex(state);
    expect(index.byAsset['MSTR']['robinhood']).toEqual(['rh-mstr-weth']);
    expect(index.byAsset['MSTRrh']).toBeUndefined();
  });

  it('collects every stablecoin-principal vault into one Stables bucket', () => {
    const index = selectSimplifiedAssetIndex(state);
    expect(Object.keys(index.byAsset).sort()).toEqual(['GME', 'MSTR', STABLES_ASSET_KEY, 'WETH']);
    expect(index.byAsset[STABLES_ASSET_KEY]['ethereum']).toEqual([
      'eth-usdc-lend',
      'eth-usdc-usdt',
    ]);
    // aliased bridged stables land in the same bucket
    expect(index.byAsset[STABLES_ASSET_KEY]['arbitrum']).toEqual(['arb-usdc-lend']);
  });

  it('orders assets, chains and vaults by tvl desc', () => {
    // Stables 900+300+5000=6200, WETH 100+7000=7100, GME 500
    expect(selectSimplifiedAssetKeysByTvl(state)).toEqual([
      'WETH',
      STABLES_ASSET_KEY,
      'GME',
      'MSTR',
    ]);
    expect(selectSimplifiedChainIdsByTvl(state, STABLES_ASSET_KEY)).toEqual([
      'arbitrum',
      'ethereum',
    ]);
    expect(selectSimplifiedVaultIdsByTvl(state, STABLES_ASSET_KEY, 'ethereum')).toEqual([
      'eth-usdc-lend',
      'eth-usdc-usdt',
    ]);
  });

  it('reshapes the whole list when the asset-type filter is applied', () => {
    const clmOnly = makeState(VAULTS, TVL, { assetType: ['clm'] });
    const index = selectSimplifiedAssetIndex(clmOnly);
    expect(Object.keys(index.byAsset)).toEqual(['WETH']);
    expect(index.byAsset['WETH']['base']).toEqual(['base-weth-clm']);
  });

  it('reshapes the whole list when the stable category filter is applied', () => {
    // only vaults whose assets are ALL stablecoins survive
    const stableOnly = makeState(VAULTS, TVL, { vaultCategory: ['stable'] });
    const index = selectSimplifiedAssetIndex(stableOnly);
    expect(Object.keys(index.byAsset)).toEqual([STABLES_ASSET_KEY]);
    expect(index.byAsset[STABLES_ASSET_KEY]['ethereum']).toEqual([
      'eth-usdc-lend',
      'eth-usdc-usdt',
    ]);
  });

  it('returns stable empty arrays for unknown groups', () => {
    const a = selectSimplifiedVaultIdsByTvl(state, 'GME', 'solana');
    expect(a).toHaveLength(0);
    expect(selectSimplifiedVaultIdsByTvl(state, 'NOPE', 'solana')).toBe(a);
    expect(selectSimplifiedChainIdsByTvl(state, 'NOPE')).toHaveLength(0);
  });

  it('memoizes the index', () => {
    expect(selectSimplifiedAssetIndex(state)).toBe(selectSimplifiedAssetIndex(state));
  });
});
