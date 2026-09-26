import BigNumber from 'bignumber.js';
import { getUnixTime } from 'date-fns';
import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectClmPayoutTokens } from './apy.ts';

const CHAIN = 'base';
const CLM = 'clm';
const POOL = 'clm-rp';
const ids = { clm: CLM, pool: POOL, vault: 'clm-vault', pools: [POOL], vaults: ['clm-vault'] };
const token = (symbol: string, address: string) => ({
  symbol,
  address,
  oracleId: symbol,
  decimals: 18,
  chainId: CHAIN,
});
const CAKE = token('CAKE', '0xcake');
const OLD = token('OLD', '0xold');
const USDC = token('USDC', '0xusdc');

type Options = {
  /** what the pool streams on-chain, with a live reward period unless `finished` */
  streamed?: Array<typeof CAKE>;
  /** the pool's config list, which no runtime data ever fills in */
  configEarned?: Array<typeof CAKE>;
  finished?: boolean;
  merkl?: Array<typeof CAKE>;
};

function makeState({ streamed, configEarned = [], finished, merkl }: Options): BeefyState {
  const now = getUnixTime(new Date());
  const campaigns = (merkl ?? []).map((rewardToken, i) => [
    `c${i}`,
    { id: `c${i}`, rewardToken, startTimestamp: now - 100, endTimestamp: now + 100 },
  ]);
  return {
    entities: {
      vaults: {
        byId: {
          [CLM]: {
            id: CLM,
            type: 'cowcentrated',
            chainId: CHAIN,
            cowcentratedIds: ids,
            assetIds: ['SOL', 'USDC'],
          },
          plain: {
            id: 'plain',
            type: 'standard',
            subType: 'standard',
            chainId: CHAIN,
            depositTokenAddress: '0xlp',
            receiptTokenAddress: '0xmooplain',
          },
          [POOL]: {
            id: POOL,
            type: 'gov',
            subType: 'cowcentrated',
            chainId: CHAIN,
            cowcentratedIds: ids,
            earnedTokenAddresses: configEarned.map(t => t.address),
          },
        },
      },
      tokens: {
        byChainId: {
          [CHAIN]: {
            byAddress: Object.fromEntries([CAKE, OLD, USDC].map(t => [t.address.toLowerCase(), t])),
          },
        },
        prices: { byOracleId: { CAKE: new BigNumber(2), OLD: new BigNumber(2) } },
      },
    },
    biz: {
      tvl: { byVaultId: { [POOL]: { rawTvl: new BigNumber(1000) } } },
      rewards: {
        gov: {
          byVaultId:
            streamed ?
              {
                [POOL]: streamed.map((rewardToken, index) => ({
                  index,
                  token: rewardToken,
                  rewardRate: new BigNumber(1),
                  periodFinish: new Date(Date.now() + (finished ? -1 : 1) * 86_400_000),
                })),
              }
            : {},
        },
        offchain: {
          byId: Object.fromEntries(campaigns),
          byProviderId: {
            merkl: campaigns.length ? { [CLM]: campaigns.map(([id]) => ({ id, apr: 0.1 })) } : {},
            stellaswap: {},
          },
        },
      },
    },
  } as unknown as BeefyState;
}

describe('selectClmPayoutTokens', () => {
  it('names what the pool streams on-chain, which config often omits', () => {
    const state = makeState({ streamed: [CAKE] });
    expect(selectClmPayoutTokens(state, CLM)).toEqual(['CAKE']);
  });

  it('drops a config token the pool has stopped streaming', () => {
    const state = makeState({ streamed: [OLD], configEarned: [OLD], finished: true });
    expect(selectClmPayoutTokens(state, CLM)).toEqual([]);
  });

  it('falls back to config until the contract data lands', () => {
    const state = makeState({ configEarned: [CAKE] });
    expect(selectClmPayoutTokens(state, CLM)).toEqual(['CAKE']);
  });

  it('adds campaign tokens the pool never streams, without duplicating', () => {
    const state = makeState({ streamed: [CAKE], merkl: [USDC, CAKE] });
    expect(selectClmPayoutTokens(state, CLM)).toEqual(['CAKE', 'USDC']);
  });

  it('is undefined for a vault that is not a CLM', () => {
    expect(selectClmPayoutTokens(makeState({}), 'plain')).toBeUndefined();
  });
});
