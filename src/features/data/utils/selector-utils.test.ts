import { describe, expect, it } from 'vitest';
import type { BeefyState } from '../store/types.ts';
import {
  stableSelector,
  stableSelector1,
  stableSelector2,
  stableSelector2Req,
} from './selector-utils.ts';

/**
 * reselect's `resultEqualityCheck` compares against a single `lastResult` shared by the whole
 * selector, so interleaved arguments make every call miss. Neither the react-redux nor the
 * reselect dev check can see this - both call the selector twice with the same state, which hits
 * the same cache node regardless - so it needs its own test.
 */
const newState = () => ({ tick: 1 }) as unknown as BeefyState;

describe('stable selector helpers', () => {
  it('keeps the reference for a single argument set across dispatches', () => {
    const sel = stableSelector((_s: BeefyState) => ({ v: 1 }));
    const a = sel(newState());
    const b = sel(newState());
    expect(a).toBe(b);
  });

  it('keeps each key its own reference when arguments interleave', () => {
    const sel = stableSelector1((_s: BeefyState, id: string) => ({ id }));
    let s = newState();
    const a1 = sel(s, 'A'),
      b1 = sel(s, 'B'),
      c1 = sel(s, 'C');
    s = newState();
    const a2 = sel(s, 'A'),
      b2 = sel(s, 'B'),
      c2 = sel(s, 'C');
    expect(a2).toBe(a1);
    expect(b2).toBe(b1);
    expect(c2).toBe(c1);
  });

  it('keeps references stable for two-argument selectors under interleaving', () => {
    const sel = stableSelector2((_s: BeefyState, id: string, who?: string) => ({ id, who }));
    let s = newState();
    const a1 = sel(s, 'A', 'x'),
      b1 = sel(s, 'B', 'y'),
      n1 = sel(s, 'A');
    s = newState();
    expect(sel(s, 'A', 'x')).toBe(a1);
    expect(sel(s, 'B', 'y')).toBe(b1);
    expect(sel(s, 'A')).toBe(n1);
  });

  it('keeps references stable for required two-argument selectors', () => {
    const sel = stableSelector2Req((_s: BeefyState, a: string, b: string) => ({ a, b }));
    let s = newState();
    const x1 = sel(s, 'A', '1'),
      y1 = sel(s, 'B', '2');
    s = newState();
    expect(sel(s, 'A', '1')).toBe(x1);
    expect(sel(s, 'B', '2')).toBe(y1);
  });

  it('still returns a new reference when the value actually changes', () => {
    let n = 1;
    const sel = stableSelector1((_s: BeefyState, id: string) => ({ id, n }));
    const a1 = sel(newState(), 'A');
    n = 2;
    const a2 = sel(newState(), 'A');
    expect(a2).not.toBe(a1);
    expect(a2).toEqual({ id: 'A', n: 2 });
  });
});
