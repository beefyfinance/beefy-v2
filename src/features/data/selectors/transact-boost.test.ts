import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import {
  selectTransactBoostAvailable,
  selectTransactOptionsForSelectionId,
  selectTransactVisibleSelectionIds,
} from './transact.ts';

type Opt = { id: string; selectionId: string; boostId?: string };

const plain: Opt = { id: 'curve-usdc', selectionId: 'usdc' };
const boosted: Opt = { id: 'curve-usdc-boost', selectionId: 'usdc', boostId: 'live' };
const conic: Opt = { id: 'conic-eth', selectionId: 'eth' };

function makeState(withBoost: boolean | undefined, liveBoostIds: string[] = ['live']): BeefyState {
  const options = [plain, boosted, conic];
  return {
    ui: {
      transact: {
        vaultId: 'v1',
        withBoost,
        options: {
          byOptionId: Object.fromEntries(options.map(o => [o.id, o])),
          bySelectionId: { usdc: [plain.id, boosted.id], eth: [conic.id] },
        },
        selections: { allSelectionIds: ['usdc', 'eth'] },
      },
    },
    entities: {
      promos: {
        byId: Object.fromEntries(
          liveBoostIds.map(id => [id, { id, type: 'boost', vaultId: 'v1', version: 2 }])
        ),
        statusById: Object.fromEntries(liveBoostIds.map(id => [id, 'active'])),
        byVaultId: { v1: { allIds: liveBoostIds, byType: { boost: { allIds: liveBoostIds } } } },
      },
    },
  } as unknown as BeefyState;
}

describe('selectTransactOptionsForSelectionId', () => {
  it('shows the plain options when the checkbox is off', () => {
    expect(selectTransactOptionsForSelectionId(makeState(false), 'usdc')).toEqual([plain]);
  });

  it('shows the boosted counterparts when the checkbox is on or untouched', () => {
    expect(selectTransactOptionsForSelectionId(makeState(true), 'usdc')).toEqual([boosted]);
    expect(selectTransactOptionsForSelectionId(makeState(undefined), 'usdc')).toEqual([boosted]);
  });

  it('hides a selection without counterparts while the checkbox is on', () => {
    expect(selectTransactOptionsForSelectionId(makeState(true), 'eth')).toEqual([]);
    expect(selectTransactVisibleSelectionIds(makeState(true))).toEqual(['usdc']);
    expect(selectTransactVisibleSelectionIds(makeState(false))).toEqual(['usdc', 'eth']);
  });

  it('falls back to the plain options once the boost is no longer stakeable', () => {
    expect(selectTransactOptionsForSelectionId(makeState(true, []), 'usdc')).toEqual([plain]);
    expect(selectTransactBoostAvailable(makeState(true, []))).toBe(false);
  });
});

describe('selectTransactBoostAvailable', () => {
  it('is true when any fetched option can stake into the live boost', () => {
    expect(selectTransactBoostAvailable(makeState(false))).toBe(true);
    expect(selectTransactBoostAvailable(makeState(false, ['other']))).toBe(false);
  });
});
