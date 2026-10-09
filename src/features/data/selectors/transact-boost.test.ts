import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import {
  selectTransactBoostAvailableForSelectionId,
  selectTransactOptionsForSelectionId,
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

  it('shows the plain options for a selection without counterparts regardless of the checkbox', () => {
    expect(selectTransactOptionsForSelectionId(makeState(true), 'eth')).toEqual([conic]);
  });

  it('falls back to the plain options once the boost is no longer stakeable', () => {
    expect(selectTransactOptionsForSelectionId(makeState(true, []), 'usdc')).toEqual([plain]);
    expect(selectTransactBoostAvailableForSelectionId(makeState(true, []), 'usdc')).toBe(false);
  });
});

describe('selectTransactBoostAvailableForSelectionId', () => {
  it('is true only for selections with a counterpart of the live boost', () => {
    expect(selectTransactBoostAvailableForSelectionId(makeState(false), 'usdc')).toBe(true);
    expect(selectTransactBoostAvailableForSelectionId(makeState(false), 'eth')).toBe(false);
  });
});
