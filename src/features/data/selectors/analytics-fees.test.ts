import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectClmAutocompoundedPendingFeesByVaultId, selectHeldClmSideIds } from './analytics.ts';

const WALLET = '0x0000000000000000000000000000000000000001';
const CHAIN = 'base';
const CLM_TOKEN = '0xclm';
const RP = '0xrp';
const MOO = '0xmoo';
const T0 = '0xusdc';
const T1 = '0xcat';

const ids = {
  clm: 'clm',
  pool: 'clm-rp',
  vault: 'clm-vault',
  pools: ['clm-rp'],
  vaults: ['clm-vault'],
};

const tok = (address: string, oracleId: string) => ({
  id: oracleId,
  address,
  chainId: CHAIN,
  decimals: 18,
  oracleId,
  symbol: oracleId,
  type: 'erc20',
});

/** a side's compounded-fee timeline: `n` token0 and `n` token1, $1 each */
const timeline = (n: number) => ({
  tokens: [tok(T0, 'usdc'), tok(T1, 'cat')],
  harvests: [
    {
      timestamp: new Date(1_700_000_000_000),
      amounts: [new BigNumber(n), new BigNumber(n)],
      amountsUsd: [new BigNumber(n), new BigNumber(n)],
      totalUsd: new BigNumber(2 * n),
      cumulativeAmounts: [new BigNumber(n), new BigNumber(n)],
      cumulativeAmountsUsd: [new BigNumber(n), new BigNumber(n)],
      cumulativeTotalUsd: new BigNumber(2 * n),
    },
  ],
  totals: [new BigNumber(n), new BigNumber(n)],
  totalsUsd: [new BigNumber(n), new BigNumber(n)],
  totalUsd: new BigNumber(2 * n),
});

/** 40 CLM staked in the pool, 50 moo (= 60 CLM at ppfs 1.2) in the vault: 100 CLM of 1000 total */
function state(): BeefyState {
  return {
    entities: {
      vaults: {
        byId: {
          clm: {
            id: 'clm',
            type: 'cowcentrated',
            chainId: CHAIN,
            cowcentratedIds: ids,
            depositTokenAddress: CLM_TOKEN,
            depositTokenAddresses: [T0, T1],
            receiptTokenAddress: CLM_TOKEN,
            strategyTypeId: 'compounds',
          },
          'clm-rp': {
            id: 'clm-rp',
            type: 'gov',
            subType: 'cowcentrated',
            version: 2,
            chainId: CHAIN,
            cowcentratedIds: ids,
            depositTokenAddress: CLM_TOKEN,
            depositTokenAddresses: [T0, T1],
            receiptTokenAddress: RP,
            strategyTypeId: 'compounds',
          },
          'clm-vault': {
            id: 'clm-vault',
            type: 'standard',
            subType: 'cowcentrated',
            chainId: CHAIN,
            cowcentratedIds: ids,
            depositTokenAddress: CLM_TOKEN,
            depositTokenAddresses: [T0, T1],
            receiptTokenAddress: MOO,
            strategyTypeId: 'compounds',
          },
        },
        contractData: { byVaultId: { 'clm-vault': { pricePerFullShare: new BigNumber(1.2) } } },
      },
      tokens: {
        byChainId: {
          [CHAIN]: {
            byAddress: {
              [CLM_TOKEN]: tok(CLM_TOKEN, 'clm-lp'),
              [MOO]: tok(MOO, 'moo'),
              [RP]: tok(RP, 'rp'),
              [T0]: tok(T0, 'usdc'),
              [T1]: tok(T1, 'cat'),
            },
          },
        },
        prices: {
          byOracleId: {
            'clm-lp': new BigNumber(5),
            usdc: new BigNumber(1),
            cat: new BigNumber(1),
          },
        },
      },
      fees: { byId: {} },
      promos: { byId: {}, byVaultId: {} },
    },
    user: {
      wallet: { address: WALLET },
      balance: {
        byAddress: {
          [WALLET]: {
            depositedVaultIds: ['clm-rp', 'clm-vault'],
            tokenAmount: {
              byChainId: {
                [CHAIN]: {
                  byTokenAddress: {
                    [MOO]: { balance: new BigNumber(50) },
                    [RP]: { balance: new BigNumber(40) },
                  },
                },
              },
              byGovVaultId: { 'clm-rp': { balance: new BigNumber(40) } },
              byBoostId: {},
              byVaultId: {},
            },
          },
        },
      },
      analytics: {
        byAddress: {
          [WALLET]: {
            // each side compounded $20 of fees -> the group compounded $40
            clmHarvests: { byVaultId: { 'clm-rp': timeline(10) } },
            clmVaultHarvests: { byVaultId: { 'clm-vault': timeline(10) } },
          },
        },
        // 1000 CLM total supply, 100 token0 + 100 token1 of unclaimed trading fees
        clmPendingRewards: {
          byVaultId: {
            clm: {
              fees0: new BigNumber(100),
              fees1: new BigNumber(100),
              totalSupply: new BigNumber(1000),
            },
            'clm-rp': {
              fees0: new BigNumber(100),
              fees1: new BigNumber(100),
              totalSupply: new BigNumber(1000),
            },
            'clm-vault': {
              fees0: new BigNumber(100),
              fees1: new BigNumber(100),
              totalSupply: new BigNumber(1000),
            },
          },
        },
      },
    },
  } as unknown as BeefyState;
}

describe('selectClmAutocompoundedPendingFeesByVaultId', () => {
  it('reports the whole group on the merged page, compounded and pending alike', () => {
    const s = state();
    // 40 CLM staked + 50 moo (60 CLM at ppfs 1.2) = 100 CLM of a 1000 supply -> a tenth of the fees
    for (const side of ['clm-rp', 'clm-vault']) {
      const fees = selectClmAutocompoundedPendingFeesByVaultId(s, side, WALLET, true);
      expect(fees.totalAutocompounded.toString()).toBe('40');
      expect(fees.pendingRewards0.toString()).toBe('10');
      expect(fees.totalPending.toString()).toBe('20');
    }
  });

  it('reports one side off the merged page, its shares priced in CLM tokens', () => {
    const s = state();
    const fees = selectClmAutocompoundedPendingFeesByVaultId(s, 'clm-vault', WALLET, false);
    expect(fees.totalAutocompounded.toString()).toBe('20');
    // 50 moo shares are 60 CLM tokens, not 50: dividing shares by the CLM supply understates it
    expect(fees.pendingRewards0.toString()).toBe('6');
  });

  it('falls back to a wrapperless CLM own harvests, which is all the chart has to draw', () => {
    const s = state();
    const bare = ids.clm;
    (s.entities.vaults.byId[bare] as unknown as { cowcentratedIds: unknown }).cowcentratedIds = {
      clm: bare,
      pool: undefined,
      vault: undefined,
      pools: [],
      vaults: [],
    };
    (
      s.user.analytics.byAddress[WALLET] as unknown as {
        clmHarvests: { byVaultId: Record<string, unknown> };
      }
    ).clmHarvests.byVaultId[bare] = timeline(10);

    expect(
      selectClmAutocompoundedPendingFeesByVaultId(
        s,
        bare,
        WALLET,
        true
      ).totalAutocompounded.toString()
    ).toBe('20');
  });
});

describe('fees card selector stability', () => {
  /** models a dispatch that touched nothing the card reads */
  const untouched = (s: BeefyState) => ({ ...s, ui: { ...s.ui } }) as BeefyState;

  it('holds its reference so the header does not re-render on every action', () => {
    const s = state();
    expect(selectHeldClmSideIds(s, 'clm-rp', WALLET)).toBe(
      selectHeldClmSideIds(untouched(s), 'clm-rp', WALLET)
    );
    expect(selectClmAutocompoundedPendingFeesByVaultId(s, 'clm-rp', WALLET, true)).toBe(
      selectClmAutocompoundedPendingFeesByVaultId(untouched(s), 'clm-rp', WALLET, true)
    );
  });
});
