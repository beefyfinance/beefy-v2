import { describe, expect, it } from 'vitest';
import { isRelevanceSortActive } from './filtered-vaults-types.ts';
import { filteredVaultsActions, filteredVaultsSlice } from './filtered-vaults.ts';

const { reducer } = filteredVaultsSlice;
const initial = reducer(undefined, { type: '@@INIT' });

describe('sortPickedDuringSearch transitions', () => {
  it('starts false and relevance is inactive without search text', () => {
    expect(initial.sortPickedDuringSearch).toBe(false);
    expect(isRelevanceSortActive(initial)).toBe(false);
  });

  it('starting a search activates relevance', () => {
    const state = reducer(initial, filteredVaultsActions.setSearchText('eth'));
    expect(isRelevanceSortActive(state)).toBe(true);
  });

  it('whitespace-only search text does not activate relevance', () => {
    const state = reducer(initial, filteredVaultsActions.setSearchText('  -  '));
    expect(isRelevanceSortActive(state)).toBe(false);
  });

  it('picking a sort while searching deactivates relevance', () => {
    let state = reducer(initial, filteredVaultsActions.setSearchText('eth'));
    state = reducer(state, filteredVaultsActions.setSort('tvl'));
    expect(state.sortPickedDuringSearch).toBe(true);
    expect(isRelevanceSortActive(state)).toBe(false);
    expect(state.sort).toBe('tvl');
  });

  it('every sort action marks the pick', () => {
    const searching = reducer(initial, filteredVaultsActions.setSearchText('eth'));
    for (const action of [
      filteredVaultsActions.setSort('apy'),
      filteredVaultsActions.setSortDirection('asc'),
      filteredVaultsActions.setSortFieldAndDirection({ field: 'tvl', direction: 'desc' }),
      filteredVaultsActions.setSubSort({ column: 'apy', value: 30 }),
    ]) {
      expect(reducer(searching, action).sortPickedDuringSearch).toBe(true);
    }
  });

  it('picking a sort while NOT searching does not mark the pick', () => {
    const state = reducer(initial, filteredVaultsActions.setSort('tvl'));
    expect(state.sortPickedDuringSearch).toBe(false);
  });

  it('continued typing keeps a picked sort', () => {
    let state = reducer(initial, filteredVaultsActions.setSearchText('eth'));
    state = reducer(state, filteredVaultsActions.setSort('tvl'));
    state = reducer(state, filteredVaultsActions.setSearchText('ethereum'));
    expect(state.sortPickedDuringSearch).toBe(true);
  });

  it('clearing the search resets the pick, restoring the stored sort untouched', () => {
    let state = reducer(initial, filteredVaultsActions.setSearchText('eth'));
    state = reducer(state, filteredVaultsActions.setSort('tvl'));
    state = reducer(state, filteredVaultsActions.setSearchText(''));
    expect(state.sortPickedDuringSearch).toBe(false);
    expect(state.sort).toBe('tvl');
    expect(isRelevanceSortActive(state)).toBe(false);
  });

  it('a fresh search session after clearing re-activates relevance over the stored sort', () => {
    let state = reducer(initial, filteredVaultsActions.setSearchText('eth'));
    state = reducer(state, filteredVaultsActions.setSort('tvl'));
    state = reducer(state, filteredVaultsActions.setSearchText(''));
    state = reducer(state, filteredVaultsActions.setSearchText('btc'));
    expect(isRelevanceSortActive(state)).toBe(true);
    expect(state.sort).toBe('tvl');
  });
});

describe('reset preset derivation', () => {
  it('?q= alone lands in relevance', () => {
    const state = reducer(initial, filteredVaultsActions.reset({ searchText: 'eth' }));
    expect(state.sortPickedDuringSearch).toBe(false);
    expect(isRelevanceSortActive(state)).toBe(true);
  });

  it('?q= with an explicit sort honors the sort', () => {
    const state = reducer(initial, filteredVaultsActions.reset({ searchText: 'eth', sort: 'tvl' }));
    expect(state.sortPickedDuringSearch).toBe(true);
    expect(isRelevanceSortActive(state)).toBe(false);
  });

  it('sort without search does not mark the pick', () => {
    const state = reducer(initial, filteredVaultsActions.reset({ sort: 'tvl' }));
    expect(state.sortPickedDuringSearch).toBe(false);
  });

  it('default sort with search stays in relevance', () => {
    const state = reducer(
      initial,
      filteredVaultsActions.reset({ searchText: 'eth', sort: 'default' })
    );
    expect(state.sortPickedDuringSearch).toBe(false);
    expect(isRelevanceSortActive(state)).toBe(true);
  });
});
