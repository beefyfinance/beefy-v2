import { describe, expect, it } from 'vitest';
import type { VaultCowcentrated } from '../../../data/entities/vault.ts';
import { CLM_REWARDS_DEFAULT_ON, isClmPoolOnly, resolveClmRewardsVariant } from './clm-rewards.ts';
import { resolveClmMode } from './resolve-clm-mode.ts';

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
const poolOnly = ids({ pool: 'rp', pools: ['rp'] });
// uniswap-cow-base-weth-cbbtc is live in this shape: the vault wrapper exists but is retired, so
// `vault` is undefined while `vaults` still lists it
const vaultRetired = ids({ pool: 'rp', pools: ['rp'], vaults: ['moo'] });

describe('resolveClmRewardsVariant', () => {
  it('offers the choice only when a vault wrapper is active', () => {
    expect(resolveClmRewardsVariant(bothActive)).toBe('toggle');
    expect(resolveClmRewardsVariant(poolOnly)).toBe('info');
  });

  it('treats a retired vault wrapper as absent', () => {
    expect(resolveClmRewardsVariant(vaultRetired)).toBe('info');
  });

  it('reads structure only — there is no reward-data input to read', () => {
    // the whole point of the invariant: the signature cannot express "what is streaming today",
    // so a group paying nothing right now is indistinguishable from one paying plenty
    expect(resolveClmRewardsVariant.length).toBe(1);
    expect(resolveClmRewardsVariant(bothActive)).toBe(resolveClmRewardsVariant({ ...bothActive }));
  });
});

describe('isClmPoolOnly', () => {
  it('is true exactly when no vault wrapper can harvest', () => {
    expect(isClmPoolOnly(bothActive)).toBe(false);
    expect(isClmPoolOnly(poolOnly)).toBe(true);
    expect(isClmPoolOnly(vaultRetired)).toBe(true);
  });
});

describe('deposit default', () => {
  it('follows CLM_REWARDS_DEFAULT_ON when both wrappers are available', () => {
    const expected = CLM_REWARDS_DEFAULT_ON ? 'vault' : 'pool';
    expect(resolveClmMode(bothActive, false, false, false)).toBe(expected);
  });

  it('routes pool-only groups to the pool', () => {
    expect(resolveClmMode(poolOnly, false, false, false)).toBe('pool');
    expect(resolveClmMode(vaultRetired, false, false, false)).toBe('pool');
  });
});
