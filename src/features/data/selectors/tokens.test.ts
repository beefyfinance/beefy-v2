import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectVaultImageAssets, selectVaultTokenImageAssets } from './tokens.ts';

type FixtureToken = { id: string; symbol: string };

const vaultsById = {
  'net-usdg': { id: 'net-usdg', chainId: 'robinhood', assetIds: ['NET', 'USDG'] },
  'missing-usdg': { id: 'missing-usdg', chainId: 'robinhood', assetIds: ['MISSING', 'USDG'] },
  'bifi-gov': { id: 'bifi-gov', chainId: 'robinhood', assetIds: ['USDG'], icons: ['BIFI'] },
};

const tokensByAddress: Record<string, FixtureToken> = {
  '0xnet': { id: 'NETrh', symbol: 'NET' },
  '0xusdg': { id: 'USDG', symbol: 'USDG' },
};

const aliasAddressesById = { NET: '0xnet' };

function makeState(byAddress: Record<string, FixtureToken>): BeefyState {
  const byId = Object.fromEntries(
    Object.entries(byAddress).map(([address, token]) => [token.id, address])
  );
  return {
    entities: {
      vaults: { byId: vaultsById },
      tokens: {
        byChainId: { robinhood: { byId: { ...byId, ...aliasAddressesById }, byAddress } },
      },
    },
  } as unknown as BeefyState;
}

const net = { id: 'NETrh', symbol: 'NET', chainId: 'robinhood' };
const usdg = { id: 'USDG', symbol: 'USDG', chainId: 'robinhood' };

describe('selectVaultTokenImageAssets', () => {
  const state = makeState(tokensByAddress);

  it('takes the id and symbol of the token each asset id resolves to', () => {
    expect(selectVaultTokenImageAssets(state, 'net-usdg')).toStrictEqual([net, usdg]);
  });

  it('uses the asset id as id and symbol while its token is missing', () => {
    expect(selectVaultTokenImageAssets(state, 'missing-usdg')).toStrictEqual([
      { id: 'MISSING', symbol: 'MISSING', chainId: 'robinhood' },
      usdg,
    ]);
  });

  it('switches to the token once it loads', () => {
    const loaded = makeState({ ...tokensByAddress, '0xmissing': { id: 'MISSING', symbol: 'MSG' } });
    expect(selectVaultTokenImageAssets(loaded, 'missing-usdg')).toStrictEqual([
      { id: 'MISSING', symbol: 'MSG', chainId: 'robinhood' },
      usdg,
    ]);
  });

  it('ignores the vault icons', () => {
    expect(selectVaultTokenImageAssets(state, 'bifi-gov')).toStrictEqual([usdg]);
  });
});

describe('selectVaultImageAssets', () => {
  const state = makeState(tokensByAddress);

  it('uses the vault icons as image keys', () => {
    expect(selectVaultImageAssets(state, 'bifi-gov')).toStrictEqual([
      { symbol: 'BIFI', chainId: 'robinhood' },
    ]);
  });

  it('uses the vault tokens without icons', () => {
    expect(selectVaultImageAssets(state, 'net-usdg')).toStrictEqual([net, usdg]);
  });
});

describe('vault image asset reference stability', () => {
  const state = makeState(tokensByAddress);
  const selectAll = (s: BeefyState) => [
    selectVaultImageAssets(s, 'net-usdg'),
    selectVaultImageAssets(s, 'missing-usdg'),
    selectVaultImageAssets(s, 'bifi-gov'),
    selectVaultTokenImageAssets(s, 'bifi-gov'),
  ];

  it('returns the same array for a new state root that changes nothing it reads', () => {
    const first = selectVaultImageAssets(state, 'net-usdg');
    expect(selectVaultImageAssets({ ...state }, 'net-usdg')).toBe(first);
  });

  it('holds each reference while other vaults interleave', () => {
    const first = selectAll(state);
    for (let i = 0; i < 3; i++) {
      selectAll({ ...state }).forEach((assets, index) => expect(assets).toBe(first[index]));
    }
  });

  it('holds each reference when tokens they do not use load', () => {
    const first = selectAll(state);
    const moreTokens = makeState({ ...tokensByAddress, '0xweth': { id: 'WETH', symbol: 'WETH' } });
    selectAll(moreTokens).forEach((assets, index) => expect(assets).toBe(first[index]));
  });
});
