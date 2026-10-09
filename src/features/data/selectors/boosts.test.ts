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
  it('returns the single active or prestake v2 boost', () => {
    expect(
      selectZapStakeableBoostOrUndefined(
        makeState([{ id: 'a', version: 2, status: 'active' }]),
        'v1'
      )?.id
    ).toBe('a');
    expect(
      selectZapStakeableBoostOrUndefined(
        makeState([{ id: 'p', version: 2, status: 'prestake' }]),
        'v1'
      )?.id
    ).toBe('p');
  });

  it('ignores v1 and inactive boosts', () => {
    const state = makeState([
      { id: 'old', version: 1, status: 'active' },
      { id: 'done', version: 2, status: 'inactive' },
      { id: 'live', version: 2, status: 'active' },
    ]);

    expect(selectZapStakeableBoostOrUndefined(state, 'v1')?.id).toBe('live');
  });

  it('returns undefined when none or more than one boost qualifies', () => {
    expect(selectZapStakeableBoostOrUndefined(makeState([]), 'v1')).toBeUndefined();
    expect(selectZapStakeableBoostOrUndefined(makeState([]), 'other')).toBeUndefined();
    expect(
      selectZapStakeableBoostOrUndefined(
        makeState([
          { id: 'a', version: 2, status: 'active' },
          { id: 'b', version: 2, status: 'prestake' },
        ]),
        'v1'
      )
    ).toBeUndefined();
  });
});
