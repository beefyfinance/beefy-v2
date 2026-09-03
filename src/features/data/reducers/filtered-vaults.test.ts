import { describe, expect, it } from 'vitest';
import { recalculateFilteredVaultsAction } from '../actions/filtered-vaults.ts';
import { FILTER_DEFAULTS } from '../utils/filter-values.ts';
import { filteredVaultsActions, filteredVaultsSlice } from './filtered-vaults.ts';
import {
  FilterContent,
  type FilteredVaultsState,
  type FilterValues,
  isRelevanceSortActive,
} from './filtered-vaults-types.ts';

const reducer = filteredVaultsSlice.reducer;

function stateWith(values: Partial<FilterValues>): FilteredVaultsState {
  return {
    pending: { ...FILTER_DEFAULTS, ...values },
    applied: { ...FILTER_DEFAULTS, ...values },
    sortPickedDuringSearch: false,
    filteredVaultIds: [],
    sortedFilteredVaultIds: [],
    searchRanked: false,
    filterContent: FilterContent.Filter,
  };
}

/** relevance follows the pending (editable) values in these unit tests */
function relevance(state: FilteredVaultsState): boolean {
  return isRelevanceSortActive({
    searchText: state.pending.searchText,
    sortPickedDuringSearch: state.sortPickedDuringSearch,
  });
}

describe('filteredVaultsSlice reconcile', () => {
  it('prunes chain ids outside the active set from both pending and applied', () => {
    // `canto` is an EOL chain: it passes codec validation but is never shown in the active-only
    // checklist, so it must be pruned once chain data is loaded
    const state = stateWith({ chainIds: ['base', 'canto', 'ethereum'] });
    const next = reducer(
      state,
      filteredVaultsActions.reconcile({ chainIds: ['base', 'ethereum'], platformIds: [] })
    );
    expect(next.pending.chainIds).toEqual(['base', 'ethereum']);
    expect(next.applied.chainIds).toEqual(['base', 'ethereum']);
  });

  it('prunes unknown platform ids (existing behavior)', () => {
    const state = stateWith({ platformIds: ['aave', 'notaplatform'] });
    const next = reducer(
      state,
      filteredVaultsActions.reconcile({ platformIds: ['aave'], chainIds: [] })
    );
    expect(next.pending.platformIds).toEqual(['aave']);
    expect(next.applied.platformIds).toEqual(['aave']);
  });

  it('prunes chain and platform ids together in a single reconcile', () => {
    const state = stateWith({ chainIds: ['base', 'canto'], platformIds: ['aave', 'gone'] });
    const next = reducer(
      state,
      filteredVaultsActions.reconcile({ chainIds: ['base'], platformIds: ['aave'] })
    );
    expect(next.pending.chainIds).toEqual(['base']);
    expect(next.pending.platformIds).toEqual(['aave']);
    expect(next.applied.chainIds).toEqual(['base']);
    expect(next.applied.platformIds).toEqual(['aave']);
  });
});

describe('sortPickedDuringSearch transitions', () => {
  const initial = stateWith({});

  it('starts false and relevance is inactive without search text', () => {
    expect(initial.sortPickedDuringSearch).toBe(false);
    expect(relevance(initial)).toBe(false);
  });

  it('starting a search activates relevance', () => {
    const state = reducer(initial, filteredVaultsActions.update({ searchText: 'eth' }));
    expect(relevance(state)).toBe(true);
  });

  it('whitespace-only search text does not activate relevance', () => {
    const state = reducer(initial, filteredVaultsActions.update({ searchText: '  -  ' }));
    expect(relevance(state)).toBe(false);
  });

  it('picking a sort while searching deactivates relevance', () => {
    let state = reducer(initial, filteredVaultsActions.update({ searchText: 'eth' }));
    state = reducer(state, filteredVaultsActions.update({ sort: 'tvl' }));
    expect(state.sortPickedDuringSearch).toBe(true);
    expect(relevance(state)).toBe(false);
    expect(state.pending.sort).toBe('tvl');
  });

  it('every sort action marks the pick', () => {
    const searching = reducer(initial, filteredVaultsActions.update({ searchText: 'eth' }));
    for (const action of [
      filteredVaultsActions.update({ sort: 'apy' }),
      filteredVaultsActions.update({ sortDirection: 'asc' }),
      filteredVaultsActions.update({ sort: 'tvl', sortDirection: 'desc' }),
    ]) {
      expect(reducer(searching, action).sortPickedDuringSearch).toBe(true);
    }
  });

  it('changing a sub-sort alone is not a sort pick', () => {
    const searching = reducer(initial, filteredVaultsActions.update({ searchText: 'eth' }));
    const state = reducer(searching, filteredVaultsActions.update({ subSort: { apy: 30 } }));
    expect(state.sortPickedDuringSearch).toBe(false);
    expect(relevance(state)).toBe(true);
    expect(state.pending.subSort.apy).toBe(30);
  });

  it('picking a sort while NOT searching does not mark the pick', () => {
    const state = reducer(initial, filteredVaultsActions.update({ sort: 'tvl' }));
    expect(state.sortPickedDuringSearch).toBe(false);
  });

  it('continued typing keeps a picked sort', () => {
    let state = reducer(initial, filteredVaultsActions.update({ searchText: 'eth' }));
    state = reducer(state, filteredVaultsActions.update({ sort: 'tvl' }));
    state = reducer(state, filteredVaultsActions.update({ searchText: 'ethereum' }));
    expect(state.sortPickedDuringSearch).toBe(true);
  });

  it('clearing the search resets the pick, restoring the stored sort untouched', () => {
    let state = reducer(initial, filteredVaultsActions.update({ searchText: 'eth' }));
    state = reducer(state, filteredVaultsActions.update({ sort: 'tvl' }));
    state = reducer(state, filteredVaultsActions.update({ searchText: '' }));
    expect(state.sortPickedDuringSearch).toBe(false);
    expect(state.pending.sort).toBe('tvl');
    expect(relevance(state)).toBe(false);
  });

  it('a fresh search session after clearing re-activates relevance over the stored sort', () => {
    let state = reducer(initial, filteredVaultsActions.update({ searchText: 'eth' }));
    state = reducer(state, filteredVaultsActions.update({ sort: 'tvl' }));
    state = reducer(state, filteredVaultsActions.update({ searchText: '' }));
    state = reducer(state, filteredVaultsActions.update({ searchText: 'btc' }));
    expect(relevance(state)).toBe(true);
    expect(state.pending.sort).toBe('tvl');
  });
});

describe('set preset derivation', () => {
  const initial = stateWith({});

  it('?q= alone lands in relevance', () => {
    const state = reducer(initial, filteredVaultsActions.set({ searchText: 'eth' }));
    expect(state.sortPickedDuringSearch).toBe(false);
    expect(relevance(state)).toBe(true);
  });

  it('?q= with an explicit sort honors the sort', () => {
    const state = reducer(initial, filteredVaultsActions.set({ searchText: 'eth', sort: 'tvl' }));
    expect(state.sortPickedDuringSearch).toBe(true);
    expect(relevance(state)).toBe(false);
  });

  it('sort without search does not mark the pick', () => {
    const state = reducer(initial, filteredVaultsActions.set({ sort: 'tvl' }));
    expect(state.sortPickedDuringSearch).toBe(false);
  });

  it('default sort with search stays in relevance', () => {
    const state = reducer(
      initial,
      filteredVaultsActions.set({ searchText: 'eth', sort: 'default' })
    );
    expect(state.sortPickedDuringSearch).toBe(false);
    expect(relevance(state)).toBe(true);
  });
});

describe('recalc commits pending to applied', () => {
  it('a pending update does not touch applied until recalc fulfils', () => {
    const state = reducer(stateWith({}), filteredVaultsActions.update({ searchText: 'eth' }));
    expect(state.pending.searchText).toBe('eth');
    expect(state.applied.searchText).toBe('');
  });

  it('recalc.fulfilled commits the snapshot to applied alongside the results', () => {
    const pendingState = reducer(
      stateWith({}),
      filteredVaultsActions.update({ searchText: 'eth' })
    );
    const snapshot = pendingState.pending;
    const committed = reducer(
      pendingState,
      recalculateFilteredVaultsAction.fulfilled(
        { filtered: ['a', 'b'], sorted: ['b', 'a'], applied: snapshot, searchRanked: true },
        'req-id',
        { filtersChanged: true }
      )
    );
    expect(committed.applied).toEqual(snapshot);
    expect(committed.applied.searchText).toBe('eth');
    expect(committed.filteredVaultIds).toEqual(['a', 'b']);
    expect(committed.sortedFilteredVaultIds).toEqual(['b', 'a']);
    expect(committed.searchRanked).toBe(true);
  });
});

describe('recalc preserves id-array reference identity', () => {
  function commit(state: FilteredVaultsState, filtered: string[], sorted: string[]) {
    return reducer(
      state,
      recalculateFilteredVaultsAction.fulfilled(
        { filtered, sorted, applied: state.applied, searchRanked: false },
        'req-id',
        { dataChanged: true }
      )
    );
  }

  it('keeps the previous array references when the recomputed ids are identical', () => {
    const base = stateWith({});
    const state: FilteredVaultsState = {
      ...base,
      filteredVaultIds: ['a', 'b', 'c'],
      sortedFilteredVaultIds: ['c', 'b', 'a'],
    };
    // a no-op data tick recomputes fresh arrays with identical content
    const next = commit(state, ['a', 'b', 'c'], ['c', 'b', 'a']);
    expect(next.filteredVaultIds).toBe(state.filteredVaultIds);
    expect(next.sortedFilteredVaultIds).toBe(state.sortedFilteredVaultIds);
  });

  it('replaces only the array whose contents changed', () => {
    const base = stateWith({});
    const state: FilteredVaultsState = {
      ...base,
      filteredVaultIds: ['a', 'b', 'c'],
      sortedFilteredVaultIds: ['c', 'b', 'a'],
    };
    // membership unchanged, order changed (e.g. tvl tick under a tvl sort)
    const next = commit(state, ['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(next.filteredVaultIds).toBe(state.filteredVaultIds);
    expect(next.sortedFilteredVaultIds).not.toBe(state.sortedFilteredVaultIds);
    expect(next.sortedFilteredVaultIds).toEqual(['a', 'b', 'c']);
  });

  it('replaces both arrays when membership changes', () => {
    const base = stateWith({});
    const state: FilteredVaultsState = {
      ...base,
      filteredVaultIds: ['a', 'b', 'c'],
      sortedFilteredVaultIds: ['a', 'b', 'c'],
    };
    const next = commit(state, ['a', 'b'], ['a', 'b']);
    expect(next.filteredVaultIds).not.toBe(state.filteredVaultIds);
    expect(next.filteredVaultIds).toEqual(['a', 'b']);
    expect(next.sortedFilteredVaultIds).toEqual(['a', 'b']);
  });
});
