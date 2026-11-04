import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectZapStakeableBoostOrUndefined } from './boosts.ts';

type Boost = { id: string; version: number; status: 'active' | 'prestake' | 'inactive' };

function makeState(boosts: Boost[]): BeefyState {
  return {
    entities: {
      promos: {
        byId: Object.fromEntries(boosts.map(b => [b.id, { ...b, type: 'boost', vaultId: 'v1' }])),
        statusById: Object.fromEntries(boosts.map(b => [b.id, b.status])),
        byVaultId: {
          v1: {
            allIds: boosts.map(b => b.id),
            byType: { boost: { allIds: boosts.map(b => b.id) } },
          },
        },
      },
    },
  } as unknown as BeefyState;
}

describe('selectZapStakeableBoostOrUndefined', () => {
  it('returns the one live v2 boost, ignoring v1 and ended ones, and none when two qualify', () => {
    const live = makeState([
      { id: 'old', version: 1, status: 'active' },
      { id: 'done', version: 2, status: 'inactive' },
      { id: 'live', version: 2, status: 'prestake' },
    ]);
    const two = makeState([
      { id: 'a', version: 2, status: 'active' },
      { id: 'b', version: 2, status: 'prestake' },
    ]);

    expect(selectZapStakeableBoostOrUndefined(live, 'v1')?.id).toBe('live');
    expect(selectZapStakeableBoostOrUndefined(two, 'v1')).toBeUndefined();
    expect(selectZapStakeableBoostOrUndefined(makeState([]), 'other')).toBeUndefined();
  });
});
