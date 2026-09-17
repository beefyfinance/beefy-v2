import BigNumber from 'bignumber.js';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectClmBoostVaultId } from './transact.ts';

const WALLET = '0x1234567890abcdef1234567890abcdef12345678';
const ids = {
  clm: 'clm',
  pool: 'clm-rp',
  vault: 'clm-vault',
  pools: ['clm-rp'],
  vaults: ['clm-vault'],
};

type Boosts = Record<string, Record<string, 'active' | 'prestake' | 'inactive'>>;

function makeState(boostsByVault: Boosts, stakedBoostIds: string[] = []): BeefyState {
  const byVaultId: Record<string, unknown> = {};
  const statusById: Record<string, string> = {};
  for (const [vaultId, boosts] of Object.entries(boostsByVault)) {
    byVaultId[vaultId] = { byType: { boost: { allIds: Object.keys(boosts) } } };
    Object.assign(statusById, boosts);
  }
  return {
    entities: {
      vaults: {
        byId: {
          clm: { id: 'clm', type: 'cowcentrated', cowcentratedIds: ids },
          'clm-rp': { id: 'clm-rp', type: 'gov', subType: 'cowcentrated', cowcentratedIds: ids },
          'clm-vault': {
            id: 'clm-vault',
            type: 'standard',
            subType: 'cowcentrated',
            cowcentratedIds: ids,
          },
          plain: { id: 'plain', type: 'standard' },
        },
      },
      promos: { byVaultId, statusById },
    },
    user: {
      wallet: { address: WALLET },
      balance: {
        byAddress: {
          [WALLET]: {
            tokenAmount: {
              byBoostId: Object.fromEntries(
                stakedBoostIds.map(id => [id, { balance: new BigNumber(1), rewards: [] }])
              ),
            },
          },
        },
      },
    },
  } as unknown as BeefyState;
}

describe('selectClmBoostVaultId', () => {
  // the connected-wallet lookup reads a view-as override from the URL
  beforeAll(() => {
    vi.stubGlobal('window', { location: { search: '', hostname: 'localhost' } });
  });

  it('finds the boosted side from the base CLM and from either wrapper', () => {
    const state = makeState({ 'clm-vault': { b1: 'active' } });
    expect(selectClmBoostVaultId(state, 'clm')).toBe('clm-vault');
    expect(selectClmBoostVaultId(state, 'clm-rp')).toBe('clm-vault');
    expect(selectClmBoostVaultId(state, 'clm-vault')).toBe('clm-vault');
  });

  it('counts a prestake boost, and a pool-side boost', () => {
    expect(selectClmBoostVaultId(makeState({ 'clm-rp': { b1: 'prestake' } }), 'clm')).toBe(
      'clm-rp'
    );
  });

  it('keeps an ended boost only while the user is still staked in it', () => {
    expect(selectClmBoostVaultId(makeState({ 'clm-vault': { b1: 'inactive' } }), 'clm')).toBe(
      undefined
    );
    expect(
      selectClmBoostVaultId(makeState({ 'clm-vault': { b1: 'inactive' } }, ['b1']), 'clm')
    ).toBe('clm-vault');
  });

  it('prefers a live boost over an ended one still staked on the other side', () => {
    const state = makeState({ 'clm-rp': { old: 'inactive' }, 'clm-vault': { live: 'active' } }, [
      'old',
    ]);
    expect(selectClmBoostVaultId(state, 'clm')).toBe('clm-vault');
  });

  it('is undefined for a vault outside any CLM', () => {
    expect(selectClmBoostVaultId(makeState({ plain: { b1: 'active' } }), 'plain')).toBe(undefined);
  });
});
