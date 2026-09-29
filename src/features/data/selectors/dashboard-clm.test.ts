import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import { mergeTokenEntries } from '../../../helpers/pnl.ts';
import type { BeefyState } from '../store/types.ts';
import {
  selectDashboardClmBlendedApy,
  selectDashboardRowDailyUsd,
  selectUserGlobalStats,
  selectYieldStatsByVaultId,
} from './apy.ts';
import {
  selectDashboardRowSideIds,
  selectUserDashboardVaultIds,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from './balance.ts';
import {
  combineDashboardStatuses,
  DashboardDataStatus,
  selectDashboardPrimaryVaultId,
  selectDashboardUserClmApy,
  selectDashboardUserVaultsDailyYield,
  type UserReward,
} from './dashboard.ts';

const W = '0x00000000000000000000000000000000000000aa';
const CHAIN = 'base';
const CLM = 'clm';
const POOL = 'clm-rp';
const VAULT = 'clm-vault';
const PLAIN = 'plain';
const ids = { clm: CLM, pool: POOL, vault: VAULT, pools: [POOL], vaults: [VAULT] };
const bn = (n: number) => new BigNumber(n);
const token = (address: string, oracleId: string) => ({
  address,
  oracleId,
  decimals: 18,
  chainId: CHAIN,
  symbol: oracleId,
});
const FULFILLED = { lastFulfilled: { timestamp: 1, requestId: 'x' }, status: 'fulfilled' };

type Position = {
  pool: number;
  vault: number;
  /** which sides the API has a rate for */
  apy?: 'all' | 'none' | 'no-pool' | 'no-vault';
  poolRetired?: boolean;
  /** sides whose timeline has been indexed */
  indexed?: string[];
};

/** a CLM with both wrappers, the vault side 1.1 CLM per share, a CLM at $2, and one plain vault */
function makeState({ pool, vault, apy = 'all', poolRetired, indexed = [POOL, VAULT] }: Position) {
  const deposited = [...(pool ? [POOL] : []), ...(vault ? [VAULT] : []), PLAIN];
  const rates: Record<string, object> = {
    // the CLM's own DEX-level rate, which a row never shows
    [CLM]: { totalApy: 0.9, totalDaily: 0.0025, totalType: 'apr' },
    [PLAIN]: { totalApy: 0.1, totalDaily: 0.0003, totalType: 'apy' },
  };
  if (apy === 'all' || apy === 'no-vault') {
    rates[POOL] = { totalApy: 0.365, totalDaily: 0.001, totalType: 'apr' };
  }
  if (apy === 'all' || apy === 'no-pool') {
    rates[VAULT] = { totalApy: 0.39, totalDaily: 0.0009, totalType: 'apy' };
  }
  const timeline = (id: string) => ({ current: [{ datetime: new Date(0) }], id });

  return {
    entities: {
      vaults: {
        byId: {
          [CLM]: {
            id: CLM,
            type: 'cowcentrated',
            status: 'active',
            chainId: CHAIN,
            cowcentratedIds: ids,
            depositTokenAddress: '0xdexpool',
            receiptTokenAddress: '0xclm',
            contractAddress: '0xclm',
          },
          [POOL]: {
            id: POOL,
            type: 'gov',
            subType: 'cowcentrated',
            status: poolRetired ? 'eol' : 'active',
            chainId: CHAIN,
            cowcentratedIds: ids,
            depositTokenAddress: '0xclm',
            receiptTokenAddress: '0xrp',
          },
          [VAULT]: {
            id: VAULT,
            type: 'standard',
            subType: 'cowcentrated',
            status: 'active',
            chainId: CHAIN,
            cowcentratedIds: ids,
            depositTokenAddress: '0xclm',
            receiptTokenAddress: '0xmoo',
          },
          [PLAIN]: {
            id: PLAIN,
            type: 'standard',
            subType: 'standard',
            status: 'active',
            chainId: CHAIN,
            depositTokenAddress: '0xlp',
            receiptTokenAddress: '0xmooplain',
          },
        },
        contractData: {
          byVaultId: {
            [VAULT]: { pricePerFullShare: bn(1.1) },
            [PLAIN]: { pricePerFullShare: bn(1) },
          },
        },
      },
      tokens: {
        byChainId: {
          [CHAIN]: {
            byAddress: {
              '0xclm': token('0xclm', 'clm'),
              '0xdexpool': token('0xdexpool', 'dexpool'),
              '0xmoo': token('0xmoo', 'moo'),
              '0xrp': token('0xrp', 'rp'),
              '0xlp': token('0xlp', 'lp'),
              '0xmooplain': token('0xmooplain', 'mooplain'),
            },
          },
        },
        prices: { byOracleId: { clm: bn(2), lp: bn(1) } },
      },
      promos: { byVaultId: {}, statusById: {} },
    },
    biz: { apy: { totalApy: { byVaultId: rates }, avgApy: { byVaultId: {} } } },
    user: {
      wallet: { address: W },
      analytics: {
        byAddress: {
          [W]: {
            timeline: { byVaultId: Object.fromEntries(indexed.map(id => [id, timeline(id)])) },
          },
        },
      },
      balance: {
        byAddress: {
          [W]: {
            depositedVaultIds: deposited,
            tokenAmount: {
              byChainId: {
                [CHAIN]: {
                  byTokenAddress: {
                    '0xrp': { balance: bn(pool) },
                    '0xmoo': { balance: bn(vault) },
                    '0xmooplain': { balance: bn(100) },
                  },
                },
              },
              byBoostId: {},
              byGovVaultId: { [POOL]: { balance: bn(pool), rewards: [] } },
              byVaultId: {},
            },
          },
        },
      },
    },
    ui: {
      dataLoader: {
        global: {
          chainConfig: FULFILLED,
          vaults: FULFILLED,
          promos: FULFILLED,
          platforms: FULFILLED,
          curators: FULFILLED,
          prices: FULFILLED,
          apy: apy === 'none' ? { status: 'pending' } : FULFILLED,
        },
        byChainId: { [CHAIN]: { contractData: FULFILLED } },
        byAddress: { [W]: { byChainId: { [CHAIN]: { balance: FULFILLED } } } },
      },
    },
  } as unknown as BeefyState;
}

const sum = (xs: BigNumber[]) => xs.reduce((a, b) => a.plus(b), bn(0));

describe('dashboard rows', () => {
  it('folds a CLM held on both sides into one row, where its first side stood', () => {
    const state = makeState({ pool: 100, vault: 100 });
    expect(selectUserDashboardVaultIds(state, W)).toEqual([CLM, PLAIN]);
    expect(selectUserGlobalStats(state, W).depositedVaults).toBe(2);
  });

  it('keys a single-side CLM on the CLM too', () => {
    expect(selectUserDashboardVaultIds(makeState({ pool: 0, vault: 100 }), W)).toEqual([
      CLM,
      PLAIN,
    ]);
  });

  it('lists the held sides autocompounding first; anything else is itself', () => {
    const state = makeState({ pool: 100, vault: 100 });
    expect(selectDashboardRowSideIds(state, CLM, W)).toEqual([VAULT, POOL]);
    expect(selectDashboardRowSideIds(state, PLAIN, W)).toEqual([PLAIN]);
    expect(selectDashboardRowSideIds(makeState({ pool: 0, vault: 0 }), CLM, W)).toEqual([CLM]);
  });
});

describe('row daily', () => {
  it('is the sum of its sides, and the rows add up to the portfolio Daily', () => {
    const state = makeState({ pool: 100, vault: 100 });
    const rows = selectDashboardUserVaultsDailyYield(state, W);
    const sides = sum([POOL, VAULT].map(id => selectYieldStatsByVaultId(state, id, W).dailyUsd));
    expect(rows[CLM].toNumber()).toBeCloseTo(sides.toNumber(), 12);
    expect(sum(Object.values(rows)).toNumber()).toBeCloseTo(
      selectUserGlobalStats(state, W).daily,
      9
    );
  });

  it('leaves a retired side out, as the portfolio Daily does', () => {
    const state = makeState({ pool: 100, vault: 100, poolRetired: true });
    expect(selectDashboardRowDailyUsd(state, CLM, W).toNumber()).toBeCloseTo(
      selectYieldStatsByVaultId(state, VAULT, W).dailyUsd.toNumber(),
      12
    );
  });

  it('never sums sides for the CLM itself, so the portfolio total cannot count them twice', () => {
    const state = makeState({ pool: 100, vault: 100 });
    expect(selectYieldStatsByVaultId(state, CLM, W).dailyUsd.toNumber()).toBe(0);
  });
});

describe('blended rate', () => {
  it('weights each side’s quoted rate by its deposit', () => {
    // vault 100 shares x 1.1 x $2 = $220 at 39% APY; pool 100 x $2 = $200 at 36.5% APR
    const state = makeState({ pool: 100, vault: 100 });
    const blended = selectDashboardClmBlendedApy(state, CLM, W)!;
    expect(blended).toBeCloseTo((220 * 0.39 + 200 * 0.365) / 420, 9);
    expect(selectDashboardUserClmApy(state, W)[CLM]).toBe(blended);
    const deposit = sum(
      [POOL, VAULT].map(id => selectUserVaultBalanceInUsdIncludingDisplaced(state, id, W))
    );
    expect(deposit.toNumber()).toBe(420);
  });

  it('waits for every side’s rate rather than blending in a zero', () => {
    for (const apy of ['none', 'no-pool'] as const) {
      const state = makeState({ pool: 100, vault: 100, apy });
      expect(selectDashboardClmBlendedApy(state, CLM, W)).toBeUndefined();
      expect(selectDashboardUserClmApy(state, W)[CLM]).toBe(-1);
    }
  });

  it('sorts a side with no rate last, never by the CLM’s own rate', () => {
    expect(
      selectDashboardUserClmApy(makeState({ pool: 0, vault: 100, apy: 'no-vault' }), W)[CLM]
    ).toBe(-1);
  });
});

describe('primary side', () => {
  it('is the largest side still earning', () => {
    expect(selectDashboardPrimaryVaultId(makeState({ pool: 500, vault: 10 }), CLM, W)).toBe(POOL);
    expect(
      selectDashboardPrimaryVaultId(makeState({ pool: 500, vault: 10, poolRetired: true }), CLM, W)
    ).toBe(VAULT);
  });

  it('is a side not yet indexed, so the merged numbers wait for it', () => {
    expect(
      selectDashboardPrimaryVaultId(makeState({ pool: 500, vault: 10, indexed: [POOL] }), CLM, W)
    ).toBe(VAULT);
  });
});

describe('combineDashboardStatuses', () => {
  it('is only as ready as the least ready side', () => {
    const { Available, Loading, Missing } = DashboardDataStatus;
    expect(combineDashboardStatuses([Available, Available])).toBe(Available);
    expect(combineDashboardStatuses([Available, Missing])).toBe(Missing);
    expect(combineDashboardStatuses([Missing, Loading])).toBe(Loading);
  });
});

describe('mergeTokenEntries', () => {
  const weth = { symbol: 'WETH', decimals: 18, address: '0xWeth', chainId: 'base' as const };
  const reward = (usd: number, status: UserReward['status']): UserReward => ({
    token: weth,
    amount: new BigNumber(usd / 1000),
    usd: new BigNumber(usd),
    status,
    source: 'clm',
  });
  const kind = (r: UserReward) => `${r.status}:${r.source}`;

  it('adds up the same token earned the same way on both sides', () => {
    const merged = mergeTokenEntries([reward(4, 'compounded'), reward(6, 'compounded')], kind);
    expect(merged).toHaveLength(1);
    expect(merged[0].usd.toNumber()).toBe(10);
  });

  it('keeps compounded and pending apart', () => {
    expect(mergeTokenEntries([reward(4, 'compounded'), reward(6, 'pending')], kind)).toHaveLength(
      2
    );
  });
});
