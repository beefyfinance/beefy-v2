import BigNumber from 'bignumber.js';
import { describe, expect, it, vi } from 'vitest';
import {
  baseNative,
  baseUsdc,
  baseWeth,
  erc20Token,
} from '../apis/transact/helpers/same-balance.test-helper.ts';
import type { TokenEntity, TokenLpBreakdown } from '../entities/token.ts';
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

const address = (n: number) => `0x${n.toString(16).padStart(40, '0')}`;
const net = erc20Token(CHAIN, 'NET', 'NET', address(1), 18);
const netRh = erc20Token(CHAIN, 'NETrh', 'NET', address(2), 18);
const wethNetLp = erc20Token(CHAIN, 'WETH-NET', 'WETH-NET LP', address(3), 18);
const memes = ['AERO', 'BRETT', 'DEGEN', 'TOSHI', 'VIRTUAL'].map((symbol, i) =>
  erc20Token(CHAIN, symbol, symbol, address(10 + i), 18)
);
const erc20s = [baseWeth, baseUsdc, net, netRh, wethNetLp, ...memes];

const FULFILLED = { lastFulfilled: { timestamp: 0, requestId: 'test' } };

function vault(id: string, assetIds: string[]) {
  return {
    id,
    chainId: CHAIN,
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
      chains: { allIds: [CHAIN] },
      vaults: { byId: Object.fromEntries(vaults.map(v => [v.id, v])) },
      tokens: {
        byChainId: {
          [CHAIN]: {
            native: baseNative.id,
            wnative: baseWeth.id,
            byId: Object.fromEntries([
              [baseNative.id, 'native'],
              ...erc20s.map(token => [token.id, token.address.toLowerCase()]),
            ]),
            byAddress: Object.fromEntries([
              ['native', baseNative],
              ...erc20s.map(token => [token.address.toLowerCase(), token]),
            ]),
          },
        },
        breakdown: { byOracleId: breakdowns },
        prices: {
          byOracleId: Object.fromEntries(erc20s.map(token => [token.oracleId, new BigNumber(1)])),
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

describe('selectDashboardUserExposureByToken', () => {
  it('draws a single-asset vault with its token', () => {
    const state = makeState([vault('net', ['NETrh'])]);

    expect(imagesByKey(selectDashboardUserExposureByToken(state, WALLET))).toEqual({
      NET: [{ id: 'NETrh', symbol: 'NET', chainId: CHAIN }],
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
      NET: [{ id: 'NETrh', symbol: 'NET', chainId: CHAIN }],
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
