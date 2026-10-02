import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import {
  baseNative,
  baseUsdc,
  baseWeth,
  chainTokens,
  erc20Token,
  nativeToken,
} from '../apis/transact/helpers/same-balance.test-helper.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity, TokenErc20, TokenLpBreakdown } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import type * as BalanceSelectors from './balance.ts';
import { exposureEntriesEqual, selectDashboardUserExposureByToken } from './dashboard.ts';

vi.mock('./balance.ts', async importOriginal => ({
  ...(await importOriginal<typeof BalanceSelectors>()),
  selectUserVaultBalanceInUsdIncludingDisplaced: () => new BigNumber(1),
  selectUserLpBreakdownBalance: (
    state: BeefyState,
    vault: VaultEntity,
    breakdown: TokenLpBreakdown
  ) => ({
    assets: breakdown.tokens.map(address => ({
      ...state.entities.tokens.byChainId[vault.chainId]!.byAddress[address.toLowerCase()],
      userValue: new BigNumber(1).dividedBy(breakdown.tokens.length),
    })),
  }),
}));

const WALLET = '0x1111111111111111111111111111111111111111';
const CHAIN = 'base' as const;
const OTHER_CHAIN = 'robinhood' as const;

const address = (n: number) => `0x${n.toString(16).padStart(40, '0')}`;
const stock = (token: TokenErc20, name: string): TokenErc20 => ({
  ...token,
  name,
  tags: ['STOCK'],
});
const net = erc20Token(CHAIN, 'NET', 'NET', address(1), 18);
const netRh = stock(
  erc20Token(CHAIN, 'NETrh', 'NET', address(2), 18),
  'Cloudflare • Robinhood Token'
);
const wethNetLp = erc20Token(CHAIN, 'WETH-NET', 'WETH-NET LP', address(3), 18);
const aaplC = stock(erc20Token(CHAIN, 'AAPLc', 'AAPL', address(4), 8), 'Apple Inc.');
const memes = ['AERO', 'BRETT', 'DEGEN', 'TOSHI', 'VIRTUAL'].map((symbol, i) =>
  erc20Token(CHAIN, symbol, symbol, address(10 + i), 18)
);
const erc20s = [baseUsdc, net, netRh, wethNetLp, aaplC, ...memes];

const otherNative = nativeToken(OTHER_CHAIN, 'ETH');
const otherWeth = erc20Token(OTHER_CHAIN, 'WETH', 'WETH', address(20), 18);
const aaplRh = stock(
  erc20Token(OTHER_CHAIN, 'AAPLrh', 'AAPL', address(21), 18),
  'Apple • Robinhood Token'
);

const FULFILLED = { lastFulfilled: { timestamp: 0, requestId: 'test' } };

function vault(id: string, assetIds: string[], chainId: ChainEntity['id'] = CHAIN) {
  return {
    id,
    chainId,
    assetIds,
    breakdownId: id,
    depositTokenAddress: wethNetLp.address,
  } as VaultEntity;
}

function breakdownOf(...tokens: TokenEntity[]): TokenLpBreakdown {
  return {
    price: 1,
    tokens: tokens.map(token => token.address),
    balances: tokens.map(() => '1'),
    totalSupply: '1',
  };
}

function makeState(vaults: VaultEntity[], breakdowns: Record<string, TokenLpBreakdown> = {}) {
  return {
    entities: {
      chains: { allIds: [CHAIN, OTHER_CHAIN] },
      vaults: { byId: Object.fromEntries(vaults.map(v => [v.id, v])) },
      tokens: {
        byChainId: {
          [CHAIN]: chainTokens(baseNative, baseWeth, ...erc20s),
          [OTHER_CHAIN]: chainTokens(otherNative, otherWeth, aaplRh),
        },
        breakdown: { byOracleId: breakdowns },
        prices: {
          byOracleId: Object.fromEntries(
            [baseWeth, ...erc20s].map(token => [token.oracleId, new BigNumber(1)])
          ),
        },
      },
    },
    user: {
      balance: { byAddress: { [WALLET]: { depositedVaultIds: vaults.map(v => v.id) } } },
    },
    ui: { dataLoader: { global: { prices: FULFILLED, addressBook: FULFILLED } } },
  } as unknown as BeefyState;
}

function imagesByKey(entries: ReturnType<typeof selectDashboardUserExposureByToken>) {
  return Object.fromEntries(
    entries.map(entry => [
      entry.key,
      entry.assets.map(({ id, symbol, chainId }) => ({ id, symbol, chainId })),
    ])
  );
}

function slicesByKey(entries: ReturnType<typeof selectDashboardUserExposureByToken>) {
  return Object.fromEntries(
    entries.map(({ key, label, percentage }) => [key, { label, percentage }])
  );
}

describe('selectDashboardUserExposureByToken', () => {
  it('draws a single-asset vault with its token', () => {
    const state = makeState([vault('net', ['NETrh'])]);

    expect(imagesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      'stock:NET': [{ id: 'NETrh', symbol: 'NET', chainId: CHAIN }],
    });
  });

  it('draws a wrapped native as the native it is labelled as', () => {
    const state = makeState([vault('weth', ['WETH'])]);

    expect(imagesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      ETH: [{ symbol: 'ETH', chainId: CHAIN }],
    });
  });

  it('draws each LP breakdown asset with its token', () => {
    const state = makeState([vault('lp', ['WETH', 'NETrh'])], {
      lp: breakdownOf(baseWeth, netRh),
    });

    expect(imagesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      ETH: [{ symbol: 'ETH', chainId: CHAIN }],
      'stock:NET': [{ id: 'NETrh', symbol: 'NET', chainId: CHAIN }],
    });
  });

  it('draws the vault assets without an LP breakdown', () => {
    const state = makeState([vault('lp', ['WETH', 'NETrh'])]);

    expect(imagesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      'WETH-NET LP': [
        { id: 'WETH', symbol: 'WETH', chainId: CHAIN },
        { id: 'NETrh', symbol: 'NET', chainId: CHAIN },
      ],
    });
  });

  it('draws nothing for the others slice', () => {
    const tokens = [baseUsdc, net, ...memes];
    const state = makeState(tokens.map(token => vault(token.id, [token.id])));
    const entries = selectDashboardUserExposureByToken(state, WALLET);

    expect(entries).toHaveLength(6);
    expect(entries[5].key).toBe('others');
    expect(entries[5].assets).toEqual([]);
  });

  it('keeps a stock apart from a token sharing its ticker, naming the company', () => {
    const state = makeState([vault('netnet', ['NET']), vault('cloudflare', ['NETrh'])]);

    expect(slicesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      NET: { label: 'NET', percentage: 0.5 },
      'stock:NET': { label: 'NET (Cloudflare)', percentage: 0.5 },
    });
  });

  it('labels a stock by its ticker alone when no other slice shares it', () => {
    const state = makeState([vault('cloudflare', ['NETrh'])]);

    expect(slicesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      'stock:NET': { label: 'NET', percentage: 1 },
    });
  });

  it('merges a token held on several chains, wrapped or native', () => {
    const state = makeState([
      vault('weth', ['WETH']),
      vault('other-weth', ['WETH'], OTHER_CHAIN),
      vault('other-eth', ['ETH'], OTHER_CHAIN),
    ]);

    expect(slicesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      ETH: { label: 'ETH', percentage: 1 },
    });
  });

  it('merges a stock held on several chains under its ticker', () => {
    const state = makeState([
      vault('aapl', ['AAPLc']),
      vault('other-aapl', ['AAPLrh'], OTHER_CHAIN),
    ]);

    expect(slicesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      'stock:AAPL': { label: 'AAPL', percentage: 1 },
    });
  });

  it('sums the slices beyond the top five into others', () => {
    const tokens = [baseUsdc, net, ...memes];
    const state = makeState(tokens.map(token => vault(token.id, [token.id])));
    const entries = selectDashboardUserExposureByToken(state, WALLET);

    expect(entries.map(entry => entry.label)).toEqual([
      'USDC',
      'NET',
      'AERO',
      'BRETT',
      'DEGEN',
      'Others',
    ]);
    expect(entries[5].percentage).toBeCloseTo(2 / 7);
  });
});

describe('exposureEntriesEqual', () => {
  const entry = {
    key: 'NET',
    label: 'NET',
    value: new BigNumber(1),
    percentage: 1,
    assets: [{ id: 'NET', symbol: 'NET', chainId: CHAIN }],
  };

  it('is true for entries drawn with the same assets', () => {
    expect(exposureEntriesEqual([entry], [{ ...entry, assets: [{ ...entry.assets[0] }] }])).toBe(
      true
    );
  });

  it('is false for entries drawn with different tokens', () => {
    expect(
      exposureEntriesEqual([entry], [{ ...entry, assets: [{ ...entry.assets[0], id: 'NETrh' }] }])
    ).toBe(false);
  });
});
