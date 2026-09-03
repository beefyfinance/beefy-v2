import { describe, expect, it } from 'vitest';
import { boundedLevenshtein } from './string.ts';

describe('boundedLevenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(boundedLevenshtein('usdc', 'usdc', 2)).toBe(0);
    expect(boundedLevenshtein('', '', 2)).toBe(0);
  });

  it('counts single edits', () => {
    expect(boundedLevenshtein('usdt', 'usdc', 2)).toBe(1); // substitution
    expect(boundedLevenshtein('usd', 'usdc', 2)).toBe(1); // insertion
    expect(boundedLevenshtein('usdcc', 'usdc', 2)).toBe(1); // deletion
  });

  it('counts a transposition as 2 edits', () => {
    expect(boundedLevenshtein('uscd', 'usdc', 2)).toBe(2);
  });

  it('is symmetric', () => {
    expect(boundedLevenshtein('curve', 'crv', 3)).toBe(boundedLevenshtein('crv', 'curve', 3));
  });

  it('returns max + 1 when the distance exceeds max', () => {
    expect(boundedLevenshtein('ethereum', 'usdc', 2)).toBe(3);
    expect(boundedLevenshtein('aerodrome', 'a', 2)).toBe(3); // length pruning path
  });

  it('respects the cap exactly at the boundary', () => {
    expect(boundedLevenshtein('base', 'bas', 1)).toBe(1);
    expect(boundedLevenshtein('base', 'ba', 1)).toBe(2); // exceeds cap of 1
  });
});
