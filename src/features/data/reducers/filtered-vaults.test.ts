import { describe, expect, it } from 'vitest';
import { FILTER_DEFAULTS } from '../utils/filter-values.ts';
import { filteredVaultsActions, filteredVaultsSlice } from './filtered-vaults.ts';
import {
  FilterContent,
  type FilteredVaultsState,
  type FilterValues,
} from './filtered-vaults-types.ts';

function stateWith(values: Partial<FilterValues>): FilteredVaultsState {
  return {
    pending: { ...FILTER_DEFAULTS, ...values },
    applied: { ...FILTER_DEFAULTS, ...values },
    filteredVaultIds: [],
    sortedFilteredVaultIds: [],
    filterContent: FilterContent.Filter,
  };
}

describe('filteredVaultsSlice reconcile', () => {
  it('prunes chain ids outside the active set from both pending and applied', () => {
    // `canto` is an EOL chain: it passes codec validation but is never shown in the active-only
    // checklist, so it must be pruned once chain data is loaded
    const state = stateWith({ chainIds: ['base', 'canto', 'ethereum'] });
    const next = filteredVaultsSlice.reducer(
      state,
      filteredVaultsActions.reconcile({ chainIds: ['base', 'ethereum'], platformIds: [] })
    );
    expect(next.pending.chainIds).toEqual(['base', 'ethereum']);
    expect(next.applied.chainIds).toEqual(['base', 'ethereum']);
  });

  it('prunes unknown platform ids (existing behavior)', () => {
    const state = stateWith({ platformIds: ['aave', 'notaplatform'] });
    const next = filteredVaultsSlice.reducer(
      state,
      filteredVaultsActions.reconcile({ platformIds: ['aave'], chainIds: [] })
    );
    expect(next.pending.platformIds).toEqual(['aave']);
    expect(next.applied.platformIds).toEqual(['aave']);
  });

  it('prunes chain and platform ids together in a single reconcile', () => {
    const state = stateWith({ chainIds: ['base', 'canto'], platformIds: ['aave', 'gone'] });
    const next = filteredVaultsSlice.reducer(
      state,
      filteredVaultsActions.reconcile({ chainIds: ['base'], platformIds: ['aave'] })
    );
    expect(next.pending.chainIds).toEqual(['base']);
    expect(next.pending.platformIds).toEqual(['aave']);
    expect(next.applied.chainIds).toEqual(['base']);
    expect(next.applied.platformIds).toEqual(['aave']);
  });
});
