import { createSelector } from '@reduxjs/toolkit';
import { isEqual } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import { EMPTY_ARRAY } from '../utils/selector-utils.ts';
import { selectActiveVaultBoostIds, selectAllVaultBoostIds } from './boosts.ts';
import { selectLoaderStatus, selectStatusNotifications } from './data-loader-helpers.ts';
import { selectMintersByVaultId } from './minters.ts';
import { selectUsedPlatforms, selectConcentratedLiquidityManagerPlatforms } from './platforms.ts';
import { selectAllProposalIdsBySpace } from './proposals.ts';

/** models `useSyncExternalStoreWithSelector`, which react-redux's `useSelector` is built on */
function subscribe<T>(selector: (state: BeefyState) => T, equalityFn?: (a: T, b: T) => boolean) {
  const equal = equalityFn ?? ((a: T, b: T) => Object.is(a, b));
  let hasValue = false;
  let last: T;
  let renders = 0;
  return {
    push(state: BeefyState): T {
      const next = selector(state);
      if (hasValue && equal(last, next)) {
        return last;
      }
      hasValue = true;
      last = next;
      renders += 1;
      return last;
    },
    get renders() {
      return renders;
    },
  };
}

/** mirrors react-redux's `stabilityCheck`, hence the deliberate double call */
function isStable<T>(
  selector: (state: BeefyState) => T,
  state: BeefyState,
  equalityFn?: (a: T, b: T) => boolean
): boolean {
  const equal = equalityFn ?? ((a: T, b: T) => Object.is(a, b));
  return equal(selector(state), selector(state));
}

function untouchedDispatch(state: BeefyState): BeefyState {
  return { ...state, ui: { ...state.ui } } as BeefyState;
}

function makeState() {
  return {
    entities: {
      minters: { byVaultId: { 'vault-a': ['minter-1'], 'vault-b': [] }, byId: {} },
      promos: {
        byVaultId: {
          'vault-a': { byType: { boost: { allIds: ['boost-1', 'boost-2'] } } },
          'vault-b': { byType: { boost: { allIds: ['boost-3'] } } },
          'vault-c': { byType: {} },
          'vault-d': { byType: { boost: { allIds: ['boost-2'] } } },
        },
        statusById: { 'boost-1': 'active', 'boost-2': 'inactive', 'boost-3': 'active' },
        byId: {},
      },
      platforms: {
        allIds: ['aave', 'curve'],
        activeIds: ['aave', 'curve'],
        usedIds: ['aave', 'curve'],
        byId: { aave: { id: 'aave', name: 'Aave' }, curve: { id: 'curve', name: 'Curve' } },
        byType: { alm: ['conic', 'gamma'] },
      },
      proposals: { bySpace: { beefy: { allIds: ['p1'] } }, byId: {} },
    },
    user: { wallet: { address: undefined } },
    ui: {
      dataLoader: {
        global: {},
        byChainId: {},
        byAddress: {},
        statusIndicator: {
          excludeChainIds: [],
          notifications: { common: [{ key: 'apy', category: 'api' }], byAddress: {} },
          ignored: { common: [], byAddress: {} },
        },
      },
    },
  } as unknown as BeefyState;
}

describe('reference stability across a dispatch that changes nothing they read', () => {
  const state = makeState();
  const next = untouchedDispatch(state);

  const cases: Array<[string, (s: BeefyState) => unknown]> = [
    ['selectMintersByVaultId (populated)', s => selectMintersByVaultId(s, 'vault-a')],
    ['selectMintersByVaultId (empty)', s => selectMintersByVaultId(s, 'vault-b')],
    ['selectMintersByVaultId (unknown vault)', s => selectMintersByVaultId(s, 'nope')],
    ['selectAllVaultBoostIds', s => selectAllVaultBoostIds(s, 'vault-a')],
    ['selectActiveVaultBoostIds', s => selectActiveVaultBoostIds(s, 'vault-a')],
    ['selectActiveVaultBoostIds (none active)', s => selectActiveVaultBoostIds(s, 'vault-c')],
    ['selectUsedPlatforms', selectUsedPlatforms],
    ['selectConcentratedLiquidityManagerPlatforms', selectConcentratedLiquidityManagerPlatforms],
    ['selectAllProposalIdsBySpace', s => selectAllProposalIdsBySpace(s, 'beefy')],
    ['selectStatusNotifications', selectStatusNotifications],
    ['selectLoaderStatus', selectLoaderStatus],
  ];

  it.each(cases)('%s is stable when called twice with one state', (_name, selector) => {
    expect(isStable(selector, state)).toBe(true);
  });

  it.each(cases)('%s is stable across a new state root', (_name, selector) => {
    expect(selector(next)).toBe(selector(state));
  });

  it.each(cases)('%s drives one render over ten dispatches', (_name, selector) => {
    const sub = subscribe(selector);
    for (let i = 0; i < 10; i++) {
      sub.push(untouchedDispatch(state));
    }
    expect(sub.renders).toBe(1);
  });
});

describe('shared-empty identity', () => {
  const state = makeState();

  it('every empty result is the one frozen array, across selectors and modules', () => {
    const empties = [
      selectMintersByVaultId(state, 'vault-b'),
      selectMintersByVaultId(state, 'unknown-vault'),
      selectAllVaultBoostIds(state, 'vault-c'),
      selectActiveVaultBoostIds(state, 'vault-c'),
      selectAllProposalIdsBySpace(state, 'no-such-space'),
    ];
    for (const empty of empties) {
      expect(empty).toBe(EMPTY_ARRAY);
    }
  });

  it('a filter that removes everything still lands on the shared empty', () => {
    expect(selectAllVaultBoostIds(state, 'vault-d')).toHaveLength(1);
    expect(selectActiveVaultBoostIds(state, 'vault-d')).toBe(EMPTY_ARRAY);
  });
});

describe('stability where the slices are rebuilt but value-equal', () => {
  function rebuiltDataLoader(state: BeefyState): BeefyState {
    const indicator = state.ui.dataLoader.statusIndicator;
    return {
      ...state,
      ui: {
        ...state.ui,
        dataLoader: {
          ...state.ui.dataLoader,
          global: { ...state.ui.dataLoader.global },
          byChainId: { ...state.ui.dataLoader.byChainId },
          statusIndicator: {
            ...indicator,
            excludeChainIds: [...indicator.excludeChainIds],
            notifications: {
              ...indicator.notifications,
              common: indicator.notifications.common.map(n => ({ ...n })),
            },
          },
        },
      },
    } as BeefyState;
  }

  it('selectStatusNotifications holds its reference through a rebuilt notification list', () => {
    const state = makeState();
    const first = selectStatusNotifications(state);
    const rebuilt = rebuiltDataLoader(state);
    expect(rebuilt.ui.dataLoader.statusIndicator.notifications.common).not.toBe(
      state.ui.dataLoader.statusIndicator.notifications.common
    );
    expect(selectStatusNotifications(rebuilt)).toBe(first);
  });

  it('selectLoaderStatus holds its reference through rebuilt loader slices', () => {
    const state = makeState();
    const first = selectLoaderStatus(state);
    expect(selectLoaderStatus(rebuiltDataLoader(state))).toBe(first);
  });

  it('a memoized selector WITHOUT a resultEqualityCheck does not, which is why they carry one', () => {
    const state = makeState();
    const first = selectUsedPlatforms(state);
    const rebuilt = {
      ...state,
      entities: {
        ...state.entities,
        platforms: { ...state.entities.platforms, usedIds: [...state.entities.platforms.usedIds] },
      },
    } as BeefyState;
    expect(selectUsedPlatforms(rebuilt)).not.toBe(first);
    expect(selectUsedPlatforms(rebuilt)).toEqual(first);
  });
});

describe('the per-id memo, and the lastResult trap it exists to avoid', () => {
  // reselect keeps ONE lastResult slot per memoized function, shared across argument tuples, so a
  // per-id selector with a resultEqualityCheck compares against the other id's result and misses
  const state = makeState();
  const ids = ['vault-a', 'vault-b'];

  // the whole-state input is deliberate: the combiner then misses on every dispatch, leaving
  // `resultEqualityCheck` as the only thing holding the reference
  const activeBoostIds = (s: BeefyState, id: string) =>
    (s.entities.promos.byVaultId[id]?.byType.boost?.allIds ?? []).filter(
      boostId => s.entities.promos.statusById[boostId] === 'active'
    );

  const plain = createSelector(
    (s: BeefyState) => s,
    (_s: BeefyState, id: string) => id,
    activeBoostIds,
    { memoizeOptions: { resultEqualityCheck: isEqual } }
  );

  const cached = createCachedSelector(
    (s: BeefyState) => s,
    (_s: BeefyState, id: string) => id,
    activeBoostIds,
    {
      memoizeOptions: { resultEqualityCheck: isEqual },
    }
  )((_s: BeefyState, id: string) => id);

  it('plain createSelector + resultEqualityCheck is stable for ONE id', () => {
    const runs = Array.from({ length: 4 }, () => plain(untouchedDispatch(state), 'vault-a'));
    expect(new Set(runs).size).toBe(1);
  });

  it('and loses every reference once a second id interleaves', () => {
    const runs = ids
      .concat(ids, ids, ids)
      .map(id => ({ id, value: plain(untouchedDispatch(state), id) }));
    const forA = runs.filter(r => r.id === 'vault-a').map(r => r.value);
    expect(new Set(forA).size).toBe(forA.length);
  });

  it('createCachedSelector survives the same interleaving', () => {
    const runs = ids
      .concat(ids, ids, ids)
      .map(id => ({ id, value: cached(untouchedDispatch(state), id) }));
    for (const id of ids) {
      const forId = runs.filter(r => r.id === id).map(r => r.value);
      expect(new Set(forId).size).toBe(1);
    }
  });

  it("the branch's own per-vault selectors survive it", () => {
    const runs = ids
      .concat(ids, ids, ids)
      .map(id => ({ id, value: selectActiveVaultBoostIds(untouchedDispatch(state), id) }));
    for (const id of ids) {
      expect(new Set(runs.filter(r => r.id === id).map(r => r.value)).size).toBe(1);
    }
  });
});

describe('the failure mode this branch exists to remove', () => {
  const unstable = (state: BeefyState) => state.entities.platforms.allIds.map(id => ({ id }));
  const shallowIdEqual = (a: { id: string }[], b: { id: string }[]) =>
    a.length === b.length && a.every((entry, i) => entry.id === b[i].id);

  it('is detected by the stability check, with no render needed', () => {
    const state = makeState();
    expect(isStable(unstable, state)).toBe(false);
    expect(isStable(unstable, state, shallowIdEqual)).toBe(true);
  });

  it('re-renders on every dispatch with no comparator', () => {
    const state = makeState();
    const sub = subscribe(unstable);
    for (let i = 0; i < 10; i++) {
      sub.push(untouchedDispatch(state));
    }
    expect(sub.renders).toBe(10);
  });

  it('renders once with the comparator the branch would attach', () => {
    const state = makeState();
    const sub = subscribe(unstable, shallowIdEqual);
    for (let i = 0; i < 10; i++) {
      sub.push(untouchedDispatch(state));
    }
    expect(sub.renders).toBe(1);
  });

  it('reports every stable selector above as stable, so the check is not vacuous', () => {
    const state = makeState();
    expect(isStable(selectUsedPlatforms, state)).toBe(true);
    expect(isStable(s => selectActiveVaultBoostIds(s, 'vault-a'), state)).toBe(true);
    expect(isStable(selectStatusNotifications, state)).toBe(true);
  });
});
