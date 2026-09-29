import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { selectSavedVaultIdRemap } from '../selectors/saved-vaults.ts';
import { savedVaultsActions, savedVaultsSlice } from './saved-vaults.ts';

const ids = {
  clm: 'clm',
  pool: 'clm-rp',
  vault: 'clm-vault',
  pools: ['clm-rp'],
  vaults: ['clm-vault'],
};

function stateWithSaved(saved: string[]) {
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
          plain: { id: 'plain', type: 'standard', subType: 'standard' },
        },
      },
    },
    ui: { savedVaults: { byVaultId: Object.fromEntries(saved.map(id => [id, true])) } },
  } as unknown as BeefyState;
}

function reconcile(saved: string[]) {
  const state = stateWithSaved(saved);
  return Object.keys(
    savedVaultsSlice.reducer(
      state.ui.savedVaults,
      savedVaultsActions.reconcile(selectSavedVaultIdRemap(state))
    ).byVaultId
  ).sort();
}

describe('saved vault reconcile', () => {
  it('moves a saved CLM wrapper onto its CLM row', () => {
    expect(reconcile(['clm-rp'])).toEqual(['clm']);
    expect(reconcile(['clm-vault'])).toEqual(['clm']);
  });

  it('merges both saved wrappers into one row and keeps other saves', () => {
    expect(reconcile(['clm-rp', 'clm-vault', 'plain'])).toEqual(['clm', 'plain']);
  });

  it('leaves already-migrated and unknown ids alone', () => {
    expect(selectSavedVaultIdRemap(stateWithSaved(['clm', 'plain', 'gone']))).toEqual({});
  });
});
