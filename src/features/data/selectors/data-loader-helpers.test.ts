import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LastStatus,
  LoaderState,
  LoaderStateFulfilled,
  LoaderStateIdle,
  LoaderStatePending,
  LoaderStateRejected,
} from '../reducers/data-loader-types.ts';
import type { BeefyState } from '../store/types.ts';
import {
  createAddressChainDataSelector,
  createAddressDataSelector,
  createChainDataSelector,
  createGlobalDataSelector,
  createHasLoaderDispatchedRecentlyEvaluator,
  createHasLoaderFulfilledRecentlyEvaluator,
  createShouldLoaderLoadOnceEvaluator,
  createShouldLoaderLoadRecentEvaluator,
  DEFAULT_DISPATCHED_RECENT_SECONDS,
  hasLoaderDispatchedRecentlyImpl,
  hasLoaderFulfilledOnce,
  hasLoaderFulfilledRecently,
  hasLoaderSettledOnce,
  isLoaderFulfilled,
  isLoaderIdle,
  isLoaderPending,
  isLoaderRejected,
  shouldLoaderLoadOnce,
  shouldLoaderLoadRecent,
} from './data-loader-helpers.ts';

/** a wall-clock instant that is an exact multiple of every bucket size used below (5s, 30s) */
const NOW = 1_700_000_010_000;
const ago = (seconds: number): LastStatus => ({
  timestamp: NOW - seconds * 1000,
  requestId: `req-${seconds}`,
});

const idle = (): LoaderStateIdle => ({
  status: 'idle',
  lastDispatched: undefined,
  lastFulfilled: undefined,
  lastRejected: undefined,
  error: null,
});

const pending = (o: {
  dispatched: number;
  fulfilled?: number;
  rejected?: number;
}): LoaderStatePending => ({
  status: 'pending',
  lastDispatched: ago(o.dispatched),
  lastFulfilled: o.fulfilled === undefined ? undefined : ago(o.fulfilled),
  lastRejected: o.rejected === undefined ? undefined : ago(o.rejected),
  error: null,
});

const fulfilled = (o: {
  dispatched: number;
  fulfilled: number;
  rejected?: number;
}): LoaderStateFulfilled => ({
  status: 'fulfilled',
  lastDispatched: ago(o.dispatched),
  lastFulfilled: ago(o.fulfilled),
  lastRejected: o.rejected === undefined ? undefined : ago(o.rejected),
  error: null,
});

const rejected = (o: {
  dispatched: number;
  rejected: number;
  fulfilled?: number;
}): LoaderStateRejected => ({
  status: 'rejected',
  lastDispatched: ago(o.dispatched),
  lastFulfilled: o.fulfilled === undefined ? undefined : ago(o.fulfilled),
  lastRejected: ago(o.rejected),
  error: 'boom',
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('loader status predicates', () => {
  const cases: Array<[string, LoaderState | undefined, boolean[]]> = [
    // [name, state, [idle, pending, fulfilled, rejected]]
    ['undefined (loader never created)', undefined, [true, false, false, false]],
    ['idle', idle(), [true, false, false, false]],
    ['pending', pending({ dispatched: 1 }), [false, true, false, false]],
    ['fulfilled', fulfilled({ dispatched: 2, fulfilled: 1 }), [false, false, true, false]],
    ['rejected', rejected({ dispatched: 2, rejected: 1 }), [false, false, false, true]],
    [
      'pending after a fulfil',
      pending({ dispatched: 1, fulfilled: 60 }),
      [false, true, false, false],
    ],
    [
      'pending after a rejection',
      pending({ dispatched: 1, rejected: 60 }),
      [false, true, false, false],
    ],
  ];

  it.each(cases)(
    '%s',
    (_name, state, [expectIdle, expectPending, expectFulfilled, expectRejected]) => {
      expect(isLoaderIdle(state)).toBe(expectIdle);
      expect(isLoaderPending(state)).toBe(expectPending);
      expect(isLoaderFulfilled(state)).toBe(expectFulfilled);
      expect(isLoaderRejected(state)).toBe(expectRejected);
    }
  );

  it('is a partition: exactly one status predicate holds for every state', () => {
    for (const [, state] of cases) {
      const held = [isLoaderIdle, isLoaderPending, isLoaderFulfilled, isLoaderRejected].filter(fn =>
        fn(state)
      );
      expect(held).toHaveLength(1);
    }
  });

  it('reads the clock nowhere: the answer does not move with wall time', () => {
    // mirrors CLOCK_FREE_EVALUATORS: a member that reads the clock would take the unmemoized path
    const clockFree = [
      isLoaderIdle,
      isLoaderPending,
      isLoaderRejected,
      hasLoaderFulfilledOnce,
      hasLoaderSettledOnce,
    ];
    for (const [, state] of cases) {
      vi.setSystemTime(NOW);
      const before = clockFree.map(fn => fn(state));
      vi.setSystemTime(NOW + 365 * 24 * 3600 * 1000);
      expect(clockFree.map(fn => fn(state))).toEqual(before);
    }
  });
});

describe('hasLoaderFulfilledOnce / hasLoaderSettledOnce', () => {
  it('fulfilledOnce is true only once a fulfil has been recorded, and never unsets', () => {
    expect(hasLoaderFulfilledOnce(undefined)).toBe(false);
    expect(hasLoaderFulfilledOnce(idle())).toBe(false);
    expect(hasLoaderFulfilledOnce(pending({ dispatched: 1 }))).toBe(false);
    expect(hasLoaderFulfilledOnce(rejected({ dispatched: 2, rejected: 1 }))).toBe(false);
    expect(hasLoaderFulfilledOnce(fulfilled({ dispatched: 2, fulfilled: 1 }))).toBe(true);
    expect(hasLoaderFulfilledOnce(rejected({ dispatched: 2, rejected: 1, fulfilled: 600 }))).toBe(
      true
    );
    expect(hasLoaderFulfilledOnce(pending({ dispatched: 1, fulfilled: 600 }))).toBe(true);
  });

  it('settledOnce also counts a rejection, and is implied by fulfilledOnce', () => {
    expect(hasLoaderSettledOnce(undefined)).toBe(false);
    expect(hasLoaderSettledOnce(idle())).toBe(false);
    expect(hasLoaderSettledOnce(pending({ dispatched: 1 }))).toBe(false);
    expect(hasLoaderSettledOnce(rejected({ dispatched: 2, rejected: 1 }))).toBe(true);
    expect(hasLoaderSettledOnce(fulfilled({ dispatched: 2, fulfilled: 1 }))).toBe(true);
    for (const state of [
      undefined,
      idle(),
      pending({ dispatched: 1 }),
      pending({ dispatched: 1, fulfilled: 60 }),
      rejected({ dispatched: 2, rejected: 1 }),
      fulfilled({ dispatched: 2, fulfilled: 1 }),
    ]) {
      if (hasLoaderFulfilledOnce(state)) {
        expect(hasLoaderSettledOnce(state)).toBe(true);
      }
    }
  });
});

describe('recency windows', () => {
  it('hasLoaderFulfilledRecently is strictly inside the window', () => {
    expect(hasLoaderFulfilledRecently(fulfilled({ dispatched: 301, fulfilled: 299 }))).toBe(true);
    expect(hasLoaderFulfilledRecently(fulfilled({ dispatched: 301, fulfilled: 300 }))).toBe(false);
    expect(hasLoaderFulfilledRecently(fulfilled({ dispatched: 302, fulfilled: 301 }))).toBe(false);
    expect(hasLoaderFulfilledRecently(idle())).toBe(false);
    expect(hasLoaderFulfilledRecently(undefined)).toBe(false);
    expect(hasLoaderFulfilledRecently(pending({ dispatched: 1, fulfilled: 10 }))).toBe(true);
  });

  it('a custom fulfilled window is honoured and cached per window', () => {
    const thirty = createHasLoaderFulfilledRecentlyEvaluator(30);
    expect(thirty(fulfilled({ dispatched: 40, fulfilled: 29 }))).toBe(true);
    expect(thirty(fulfilled({ dispatched: 40, fulfilled: 30 }))).toBe(false);
    expect(thirty(fulfilled({ dispatched: 40, fulfilled: 31 }))).toBe(false);
    expect(hasLoaderFulfilledRecently(fulfilled({ dispatched: 40, fulfilled: 31 }))).toBe(true);
    expect(createHasLoaderFulfilledRecentlyEvaluator(30)).toBe(thirty);
    expect(createHasLoaderFulfilledRecentlyEvaluator(300)).not.toBe(thirty);
  });

  it('hasLoaderDispatchedRecentlyImpl is strictly inside the window', () => {
    expect(hasLoaderDispatchedRecentlyImpl(pending({ dispatched: 29 }), 30)).toBe(true);
    expect(hasLoaderDispatchedRecentlyImpl(pending({ dispatched: 30 }), 30)).toBe(false);
    expect(hasLoaderDispatchedRecentlyImpl(pending({ dispatched: 31 }), 30)).toBe(false);
    expect(hasLoaderDispatchedRecentlyImpl(idle(), 30)).toBe(false);
    expect(hasLoaderDispatchedRecentlyImpl(undefined, 30)).toBe(false);
  });

  it('the dispatched evaluator defaults to DEFAULT_DISPATCHED_RECENT_SECONDS', () => {
    const dflt = createHasLoaderDispatchedRecentlyEvaluator();
    expect(DEFAULT_DISPATCHED_RECENT_SECONDS).toBe(30);
    expect(dflt(pending({ dispatched: 29 }))).toBe(true);
    expect(dflt(pending({ dispatched: 31 }))).toBe(false);
  });
});

describe('shouldLoaderLoadOnce truth table', () => {
  const W = DEFAULT_DISPATCHED_RECENT_SECONDS;

  it.each([
    ['undefined loader', undefined, true],
    ['idle', idle(), true],
    ['pending, dispatched 1s ago', pending({ dispatched: 1 }), false],
    ['pending, dispatched 10x the window ago', pending({ dispatched: 10 * W }), false],
    ['pending, fulfilled long ago', pending({ dispatched: 1, fulfilled: 10 * W }), false],
    ['rejected outside the window', rejected({ dispatched: W + 1, rejected: W + 1 }), true],
    ['rejected on the window boundary', rejected({ dispatched: W, rejected: W }), true],
    ['rejected inside the window', rejected({ dispatched: W - 1, rejected: W - 1 }), false],
    ['fulfilled', fulfilled({ dispatched: 10 * W, fulfilled: 10 * W }), false],
    [
      'rejected but fulfilled once before',
      rejected({ dispatched: 10 * W, rejected: 10 * W, fulfilled: 20 * W }),
      false,
    ],
  ] as Array<[string, LoaderState | undefined, boolean]>)('%s -> %s', (_n, state, expected) => {
    expect(shouldLoaderLoadOnce(state)).toBe(expected);
  });

  it('a pending loader is never a load-once candidate for any dispatch window', () => {
    for (const seconds of [1, 5, 30, 300, 86400]) {
      const evaluate = createShouldLoaderLoadOnceEvaluator(seconds);
      for (const age of [0, 1, seconds - 1, seconds, seconds + 1, seconds * 100]) {
        expect(evaluate(pending({ dispatched: age }))).toBe(false);
      }
    }
  });

  it('caches one evaluator per window', () => {
    expect(createShouldLoaderLoadOnceEvaluator(30)).toBe(createShouldLoaderLoadOnceEvaluator(30));
    expect(createShouldLoaderLoadOnceEvaluator(30)).toBe(shouldLoaderLoadOnce);
    expect(createShouldLoaderLoadOnceEvaluator(15)).not.toBe(
      createShouldLoaderLoadOnceEvaluator(30)
    );
  });
});

describe('shouldLoaderLoadRecent truth table', () => {
  const F = 300;
  const D = DEFAULT_DISPATCHED_RECENT_SECONDS;

  it.each([
    ['undefined loader', undefined, true],
    ['idle', idle(), true],
    ['pending, just dispatched', pending({ dispatched: 1 }), false],
    ['pending, in flight far past both windows', pending({ dispatched: 10 * F }), false],
    [
      'pending, in flight and stale data',
      pending({ dispatched: 10 * F, fulfilled: 10 * F }),
      false,
    ],
    ['fulfilled inside the data window', fulfilled({ dispatched: F - 1, fulfilled: F - 1 }), false],
    ['fulfilled outside both windows', fulfilled({ dispatched: F + 1, fulfilled: F + 1 }), true],
    ['fulfilled on the data boundary', fulfilled({ dispatched: F, fulfilled: F }), true],
    ['stale data, dispatched recently', fulfilled({ dispatched: D - 1, fulfilled: F + 1 }), false],
    [
      'stale data, dispatched on the retry boundary',
      fulfilled({ dispatched: D, fulfilled: F + 1 }),
      true,
    ],
    [
      'rejected, never fulfilled, outside retry',
      rejected({ dispatched: D + 1, rejected: D + 1 }),
      true,
    ],
    [
      'rejected, never fulfilled, inside retry',
      rejected({ dispatched: D - 1, rejected: D - 1 }),
      false,
    ],
    [
      'rejected but data still fresh',
      rejected({ dispatched: D + 1, rejected: D + 1, fulfilled: F - 1 }),
      false,
    ],
  ] as Array<[string, LoaderState | undefined, boolean]>)('%s -> %s', (_n, state, expected) => {
    expect(shouldLoaderLoadRecent(state)).toBe(expected);
  });

  it('a pending loader is never a load-recent candidate for any pair of windows', () => {
    for (const fulfilledSeconds of [5, 30, 300, 30 * 60]) {
      for (const dispatchedSeconds of [1, 30, 300]) {
        const evaluate = createShouldLoaderLoadRecentEvaluator(fulfilledSeconds, dispatchedSeconds);
        for (const age of [
          0,
          1,
          dispatchedSeconds + 1,
          fulfilledSeconds + 1,
          10 * fulfilledSeconds,
        ]) {
          expect(evaluate(pending({ dispatched: age, fulfilled: age }))).toBe(false);
        }
      }
    }
  });

  it('load-recent implies load-once for a loader that never fulfilled', () => {
    const states: Array<LoaderState | undefined> = [
      undefined,
      idle(),
      pending({ dispatched: 1 }),
      pending({ dispatched: 10_000 }),
      rejected({ dispatched: 1, rejected: 1 }),
      rejected({ dispatched: 31, rejected: 31 }),
      rejected({ dispatched: 400, rejected: 400 }),
    ];
    for (const state of states) {
      expect(shouldLoaderLoadRecent(state)).toBe(shouldLoaderLoadOnce(state));
    }
  });

  it('caches one evaluator per window pair, and the default arg gets its own slot', () => {
    expect(createShouldLoaderLoadRecentEvaluator(300, 30)).toBe(
      createShouldLoaderLoadRecentEvaluator(300, 30)
    );
    expect(createShouldLoaderLoadRecentEvaluator(300, 30)).toBe(shouldLoaderLoadRecent);
    expect(createShouldLoaderLoadRecentEvaluator(300)).not.toBe(
      createShouldLoaderLoadRecentEvaluator(300, 30)
    );
    const omitted = createShouldLoaderLoadRecentEvaluator(300);
    const explicit = createShouldLoaderLoadRecentEvaluator(300, 30);
    const probe = fulfilled({ dispatched: 40, fulfilled: 400 });
    expect(omitted(probe)).toBe(explicit(probe));
  });
});

describe('the loader lifecycle as a state machine', () => {
  it('walks idle -> pending -> fulfilled -> pending -> rejected with the expected predicates', () => {
    let state: LoaderState = idle();
    expect([shouldLoaderLoadOnce(state), shouldLoaderLoadRecent(state)]).toEqual([true, true]);

    state = pending({ dispatched: 0 });
    expect([shouldLoaderLoadOnce(state), shouldLoaderLoadRecent(state)]).toEqual([false, false]);

    state = fulfilled({ dispatched: 2, fulfilled: 0 });
    expect([shouldLoaderLoadOnce(state), shouldLoaderLoadRecent(state)]).toEqual([false, false]);

    vi.setSystemTime(NOW + 301 * 1000);
    expect([shouldLoaderLoadOnce(state), shouldLoaderLoadRecent(state)]).toEqual([false, true]);

    vi.setSystemTime(NOW);
    state = pending({ dispatched: 0, fulfilled: 400 });
    expect([shouldLoaderLoadOnce(state), shouldLoaderLoadRecent(state)]).toEqual([false, false]);

    state = rejected({ dispatched: 0, rejected: 0, fulfilled: 400 });
    expect(shouldLoaderLoadRecent(state)).toBe(false);
    vi.setSystemTime(NOW + 31 * 1000);
    expect(shouldLoaderLoadRecent(state)).toBe(true);
    expect(shouldLoaderLoadOnce(state)).toBe(false);
  });

  it('a loader stranded pending is never re-dispatched by either predicate', () => {
    const stranded = pending({ dispatched: 0 });
    for (const minutes of [0, 1, 10, 60, 24 * 60]) {
      vi.setSystemTime(NOW + minutes * 60 * 1000);
      expect(shouldLoaderLoadOnce(stranded)).toBe(false);
      expect(shouldLoaderLoadRecent(stranded)).toBe(false);
    }
  });
});

function makeState(loaders: {
  global?: Record<string, LoaderState>;
  byChainId?: Record<string, Record<string, LoaderState>>;
  byAddress?: Record<
    string,
    {
      global?: Record<string, LoaderState>;
      byChainId?: Record<string, Record<string, LoaderState>>;
    }
  >;
}): BeefyState {
  return {
    user: { wallet: { address: undefined } },
    ui: {
      dataLoader: {
        global: loaders.global ?? {},
        byChainId: loaders.byChainId ?? {},
        byAddress: loaders.byAddress ?? {},
      },
    },
  } as unknown as BeefyState;
}

describe('createGlobalDataSelector', () => {
  it('takes the unmemoized path for a clock-free evaluator', () => {
    for (const evaluate of [
      isLoaderIdle,
      isLoaderPending,
      isLoaderRejected,
      hasLoaderFulfilledOnce,
      hasLoaderSettledOnce,
    ]) {
      const selector = createGlobalDataSelector('prices', evaluate);
      expect('recomputations' in selector).toBe(false);
    }
  });

  it('memoizes any evaluator that reads the clock, so it needs a bucket to re-evaluate', () => {
    for (const evaluate of [
      hasLoaderFulfilledRecently,
      shouldLoaderLoadOnce,
      shouldLoaderLoadRecent,
      createHasLoaderDispatchedRecentlyEvaluator(15),
    ]) {
      const selector = createGlobalDataSelector('prices', evaluate, 30);
      expect('recomputations' in selector).toBe(true);
    }
  });

  it('re-evaluates a bucketed selector only when the bucket ticks', () => {
    const evaluate = vi.fn(shouldLoaderLoadOnce);
    const selector = createGlobalDataSelector('articles', evaluate, 30);
    const loader = rejected({ dispatched: 29, rejected: 29 });
    // a dispatch produces a new root object holding the same loader slice
    const call = () => selector(makeState({ global: { articles: loader } }));

    expect(call()).toBe(false);
    expect(evaluate).toHaveBeenCalledTimes(1);

    vi.setSystemTime(NOW + 29_000);
    expect(call()).toBe(false);
    expect(evaluate).toHaveBeenCalledTimes(1);

    vi.setSystemTime(NOW + 30_000);
    expect(call()).toBe(true);
    expect(evaluate).toHaveBeenCalledTimes(2);
  });

  it('refuses to build a clock-reading evaluator without a bucket', () => {
    expect(() => createGlobalDataSelector('articles', shouldLoaderLoadOnce)).toThrow(
      /reads the clock/
    );
  });

  it('still allows an evaluator that does not read the clock to skip the bucket', () => {
    const selector = createGlobalDataSelector(
      'articles',
      loader => loader?.lastDispatched?.timestamp || 0
    );
    expect(
      selector(makeState({ global: { articles: rejected({ dispatched: 29, rejected: 29 }) } }))
    ).toBeTypeOf('number');
  });

  it('re-evaluates when the loader slice itself changes, inside the same bucket', () => {
    const selector = createGlobalDataSelector('articles', shouldLoaderLoadOnce, 30);
    expect(selector(makeState({ global: { articles: pending({ dispatched: 1 }) } }))).toBe(false);
    expect(selector(makeState({ global: { articles: idle() } }))).toBe(true);
  });
});

describe('createChainDataSelector', () => {
  it('separates chains and tolerates a chain with no loader entry', () => {
    const selector = createChainDataSelector('contractData', hasLoaderFulfilledOnce);
    const state = makeState({
      byChainId: {
        ethereum: { contractData: fulfilled({ dispatched: 2, fulfilled: 1 }) },
        base: { contractData: idle() },
      },
    });
    expect(selector(state, 'ethereum')).toBe(true);
    expect(selector(state, 'base')).toBe(false);
    expect(selector(state, 'arbitrum')).toBe(false);
  });

  it('keeps one bounded memo per chain, so alternating chains do not evict each other', () => {
    const evaluate = vi.fn(shouldLoaderLoadOnce);
    const selector = createChainDataSelector('contractData', evaluate, 30);
    const eth = idle();
    const base = pending({ dispatched: 1 });
    const state = () =>
      makeState({ byChainId: { ethereum: { contractData: eth }, base: { contractData: base } } });

    for (let i = 0; i < 10; i++) {
      expect(selector(state(), 'ethereum')).toBe(true);
      expect(selector(state(), 'base')).toBe(false);
    }
    expect(evaluate).toHaveBeenCalledTimes(2);
  });
});

describe('createAddressDataSelector', () => {
  it('reads the loader under the lowercased address on both paths', () => {
    const loader = fulfilled({ dispatched: 2, fulfilled: 1 });
    const state = makeState({ byAddress: { '0xabcd': { global: { timeline: loader } } } });
    const clockFree = createAddressDataSelector('timeline', hasLoaderFulfilledOnce);
    const bucketed = createAddressDataSelector('timeline', hasLoaderFulfilledRecently, 5);
    for (const address of ['0xabcd', '0xABCD', '0xAbCd']) {
      expect(clockFree(state, address)).toBe(true);
      expect(bucketed(state, address)).toBe(true);
    }
  });

  it('gives the checksummed and lowercased forms of one wallet a single cache entry', () => {
    const evaluate = vi.fn(hasLoaderFulfilledRecently);
    const selector = createAddressDataSelector('timeline', evaluate, 5);
    const loader = fulfilled({ dispatched: 2, fulfilled: 1 });
    const state = () => makeState({ byAddress: { '0xabcd': { global: { timeline: loader } } } });
    selector(state(), '0xABCD');
    selector(state(), '0xabcd');
    selector(state(), '0xAbCd');
    expect(evaluate).toHaveBeenCalledTimes(1);
  });

  it('returns the evaluator applied to undefined for an address with no loaders', () => {
    const selector = createAddressDataSelector('timeline', hasLoaderFulfilledOnce);
    expect(selector(makeState({}), '0xdead')).toBe(false);
  });
});

describe('createAddressChainDataSelector', () => {
  it('keys on the chain and the lowercased address together', () => {
    const selector = createAddressChainDataSelector('balance', hasLoaderFulfilledOnce);
    const state = makeState({
      byAddress: {
        '0xabcd': {
          byChainId: {
            ethereum: { balance: fulfilled({ dispatched: 2, fulfilled: 1 }) },
            base: { balance: pending({ dispatched: 1 }) },
          },
        },
      },
    });
    expect(selector(state, 'ethereum', '0xABCD')).toBe(true);
    expect(selector(state, 'base', '0xABCD')).toBe(false);
    expect(selector(state, 'ethereum', '0xbeef')).toBe(false);
  });

  it('does not let one chain evict another for the same wallet', () => {
    const evaluate = vi.fn(shouldLoaderLoadRecent);
    const selector = createAddressChainDataSelector('balance', evaluate, 5);
    const eth = idle();
    const base = pending({ dispatched: 1 });
    const state = () =>
      makeState({
        byAddress: {
          '0xabcd': { byChainId: { ethereum: { balance: eth }, base: { balance: base } } },
        },
      });
    for (let i = 0; i < 10; i++) {
      expect(selector(state(), 'ethereum', '0xabcd')).toBe(true);
      expect(selector(state(), 'base', '0xabcd')).toBe(false);
    }
    expect(evaluate).toHaveBeenCalledTimes(2);
  });
});
