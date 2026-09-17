import { describe, expect, it } from 'vitest';
import { fetchAllVaults } from '../actions/vaults.ts';
import type { VaultConfig } from '../apis/config-types.ts';
import { initialPlatformsState, type PlatformsState, platformsSlice } from './platforms.ts';

type FixtureVault = Pick<VaultConfig, 'id' | 'platformId'> &
  Partial<Pick<VaultConfig, 'status' | 'tokenProviderId'>>;

/** only the fields addVaultToState reads; the entity half of the payload is never touched */
function applyVaults(state: PlatformsState, vaults: FixtureVault[]): PlatformsState {
  const action = fetchAllVaults.fulfilled(
    {
      byChainId: {
        base: vaults.map(config => ({ config, entity: config })),
      },
    } as unknown as ReturnType<typeof fetchAllVaults.fulfilled>['payload'],
    'req-id',
    undefined
  );
  return platformsSlice.reducer(state, action);
}

describe('platformsSlice fetchAllVaults', () => {
  it('records every platform in usedIds but only non-eol ones in activeIds', () => {
    const state = applyVaults(initialPlatformsState, [
      { id: 'live', platformId: 'aerodrome' },
      { id: 'dead', platformId: 'snowball', status: 'eol' },
    ]);
    expect(state.usedIds).toEqual(['aerodrome', 'snowball']);
    expect(state.activeIds).toEqual(['aerodrome']);
  });

  it('counts tokenProviderId, so an lp provider is searchable without being a vault platform', () => {
    // mellow-aero-weth-usdc is platformId aerodrome + tokenProviderId autopilot
    const state = applyVaults(initialPlatformsState, [
      { id: 'alm', platformId: 'aerodrome', tokenProviderId: 'autopilot' },
    ]);
    expect(state.usedIds).toEqual(['aerodrome', 'autopilot']);
    expect(state.activeIds).toEqual(['aerodrome', 'autopilot']);
  });

  it('deduplicates across vaults, not just within one', () => {
    const state = applyVaults(initialPlatformsState, [
      { id: 'a', platformId: 'uniswap' },
      { id: 'b', platformId: 'uniswap' },
      { id: 'c', platformId: 'uniswap', tokenProviderId: 'uniswap' },
    ]);
    // a per-vault membership set would leave ['uniswap', 'uniswap', 'uniswap']
    expect(state.usedIds).toEqual(['uniswap']);
    expect(state.activeIds).toEqual(['uniswap']);
  });

  it('is idempotent if the vault list is fetched twice', () => {
    const vaults: FixtureVault[] = [
      { id: 'live', platformId: 'aerodrome' },
      { id: 'dead', platformId: 'snowball', status: 'eol' },
    ];
    const once = applyVaults(initialPlatformsState, vaults);
    const twice = applyVaults(once, vaults);
    expect(twice.usedIds).toEqual(once.usedIds);
    expect(twice.activeIds).toEqual(once.activeIds);
  });
});
