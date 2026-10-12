import { describe, expect, it } from 'vitest';
import type { ZapFeeRule } from '../apis/config-types.ts';
import type { BeefyState } from '../store/types.ts';
import { selectClmFreeZapSide } from './zap.ts';

const CHAIN = 'base';
const CLM = 'pcs-cow-base-sol-cbbtc';
const POOL = `${CLM}-rp`;
const VAULT = `${CLM}-vault`;

const cowcentratedIds = { clm: CLM, pool: POOL, vault: VAULT, pools: [POOL], vaults: [VAULT] };

function makeState(campaignIds: string[] | undefined): BeefyState {
  const vault = (id: string, type: string) => ({
    id,
    type,
    subType: 'cowcentrated',
    chainId: CHAIN,
    status: 'active',
    platformId: 'pancakeswap',
    strategyTypeId: 'compounds',
    assetType: 'lps',
    assetIds: ['SOL', 'cbBTC'],
    cowcentratedIds,
  });
  const feeCampaigns: ZapFeeRule[] =
    campaignIds ?
      [{ id: 'free', bps: 0, featured: true, output: { vault: { ids: campaignIds } } }]
    : [];
  return {
    entities: {
      vaults: {
        byId: {
          [CLM]: vault(CLM, 'cowcentrated'),
          [POOL]: vault(POOL, 'gov'),
          [VAULT]: vault(VAULT, 'standard'),
        },
      },
      zaps: {
        zaps: { byChainId: { [CHAIN]: { chainId: CHAIN, feeRecipient: '0xfee', feeBps: 5 } } },
        feeCampaigns,
      },
    },
  } as unknown as BeefyState;
}

describe('selectClmFreeZapSide', () => {
  it('names the autocompounding side when only the vault wrapper is covered', () => {
    expect(selectClmFreeZapSide(makeState([VAULT]), CLM)).toBe('vault');
  });

  it('names the manual side when only the pool wrapper is covered', () => {
    expect(selectClmFreeZapSide(makeState([POOL]), CLM)).toBe('pool');
  });

  it('names no side when the campaign covers both modes', () => {
    expect(selectClmFreeZapSide(makeState([POOL, VAULT]), CLM)).toBeUndefined();
  });

  it('names no side without a campaign', () => {
    expect(selectClmFreeZapSide(makeState(undefined), CLM)).toBeUndefined();
  });

  it('answers for the group when asked by a wrapper id', () => {
    expect(selectClmFreeZapSide(makeState([VAULT]), POOL)).toBe('vault');
  });
});
