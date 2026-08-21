import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import type { VaultCowcentrated } from '../../../data/entities/vault.ts';
import { clmModeToVaultId, pickClmPositionSide, resolveClmMode } from './resolve-clm-mode.ts';

type CowcentratedIds = VaultCowcentrated['cowcentratedIds'];

function ids(overrides: Partial<CowcentratedIds> = {}): CowcentratedIds {
  return {
    clm: 'clm',
    pool: undefined,
    vault: undefined,
    pools: [],
    vaults: [],
    ...overrides,
  } as CowcentratedIds;
}

const bothActive = ids({ pool: 'rp', vault: 'moo', pools: ['rp'], vaults: ['moo'] });

describe('resolveClmMode', () => {
  it('follows the money when the user holds exactly one side', () => {
    expect(resolveClmMode(bothActive, false, true, false)).toBe('pool');
    expect(resolveClmMode(bothActive, true, false, false)).toBe('vault');
  });

  // uniswap-cow-base-weth-cbbtc is live in this shape: retired vault wrapper, active pool
  const vaultRetired = ids({ pool: 'rp', vault: undefined, pools: ['rp'], vaults: ['moo'] });

  it('does not start a deposit on a wrapper that no longer accepts funds', () => {
    // without this the form renders "retired" and the toggle locks, with no way to reach the pool
    expect(resolveClmMode(vaultRetired, true, false, false)).toBe('pool');
  });

  it('still follows the money on withdraw, retired or not', () => {
    expect(resolveClmMode(vaultRetired, true, false, true)).toBe('vault');
  });

  it('sends withdraw to the larger position, not the deposit default', () => {
    // holding both sides skips resolveClmMode's follow-the-money branch entirely, so withdraw
    // has to pick by size or a $5 vault position hides a $5,000 pool one
    expect(pickClmPositionSide(new BigNumber(5), new BigNumber(5000))).toBe('pool');
    expect(pickClmPositionSide(new BigNumber(5000), new BigNumber(5))).toBe('vault');
    // and the deposit default is the opposite answer for the same holdings
    expect(resolveClmMode(bothActive, true, true, false)).toBe('vault');
  });

  it('defaults to autocompounding when the user holds both or neither', () => {
    expect(resolveClmMode(bothActive, true, true, false)).toBe('vault');
    expect(resolveClmMode(bothActive, false, false, false)).toBe('vault');
  });

  it('falls back to a retired side when neither wrapper is active', () => {
    expect(resolveClmMode(ids({ pools: ['rp'] }), false, false, false)).toBe('pool');
    expect(resolveClmMode(ids({ vaults: ['moo'] }), false, false, false)).toBe('vault');
  });
});

describe('pickClmPositionSide', () => {
  const n = (v: number) => new BigNumber(v);

  it('is undefined when the user holds neither side', () => {
    expect(pickClmPositionSide(n(0), n(0))).toBeUndefined();
  });

  it('picks the only side held', () => {
    expect(pickClmPositionSide(n(100), n(0))).toBe('vault');
    expect(pickClmPositionSide(n(0), n(100))).toBe('pool');
  });

  it('picks the larger side when both are held', () => {
    expect(pickClmPositionSide(n(900), n(100))).toBe('vault');
    expect(pickClmPositionSide(n(100), n(900))).toBe('pool');
  });

  it('breaks an exact tie toward autocompounding', () => {
    expect(pickClmPositionSide(n(500), n(500))).toBe('vault');
  });

  it('ignores the yield mode entirely — balances are the only input', () => {
    // a user whose deposits route to the pool but whose money sits in the vault
    expect(pickClmPositionSide(n(4120.9), n(0))).toBe('vault');
  });
});

describe('clmModeToVaultId', () => {
  it('prefers the active wrapper', () => {
    expect(clmModeToVaultId(bothActive, 'vault')).toBe('moo');
    expect(clmModeToVaultId(bothActive, 'pool')).toBe('rp');
  });

  it('falls back to the most recent retired wrapper', () => {
    expect(clmModeToVaultId(ids({ vaults: ['old-moo'] }), 'vault')).toBe('old-moo');
  });

  it('falls back to the clm itself when a side has no wrapper at all', () => {
    expect(clmModeToVaultId(ids({ vault: 'moo', vaults: ['moo'] }), 'pool')).toBe('clm');
  });
});
