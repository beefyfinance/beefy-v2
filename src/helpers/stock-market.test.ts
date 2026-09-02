import { describe, expect, it } from 'vitest';
import { getDayAgoState, getWeekendState } from './stock-market.ts';

/** 2026-08-28 was a Friday on EDT (UTC-4), 2026-12-25 a Friday on EST (UTC-5) */
describe('getWeekendState', () => {
  it('is closed from the Friday bell', () => {
    const { weekend } = getWeekendState(new Date('2026-08-28T20:00:00Z'));
    expect(weekend?.closedAt.toISOString()).toBe('2026-08-28T20:00:00.000Z');
    expect(weekend?.reopensAt.toISOString()).toBe('2026-08-31T00:00:00.000Z');
  });

  it('is open in the minute before the Friday bell', () => {
    expect(getWeekendState(new Date('2026-08-28T19:59:59Z')).weekend).toBeUndefined();
  });

  it('stays closed all weekend', () => {
    for (const at of ['2026-08-29T12:00:00Z', '2026-08-30T23:59:59Z']) {
      expect(getWeekendState(new Date(at)).weekend).toBeDefined();
    }
  });

  it('reopens at 09:00 Tokyo on Monday', () => {
    expect(getWeekendState(new Date('2026-08-31T00:00:00Z')).weekend).toBeUndefined();
  });

  it('is open midweek', () => {
    expect(getWeekendState(new Date('2026-09-02T13:00:00Z')).weekend).toBeUndefined();
  });

  it('follows the New York DST shift', () => {
    // EST: the bell is 21:00 UTC, so 20:30 UTC is still open
    expect(getWeekendState(new Date('2026-12-25T20:30:00Z')).weekend).toBeUndefined();
    const { weekend } = getWeekendState(new Date('2026-12-25T21:00:00Z'));
    expect(weekend?.closedAt.toISOString()).toBe('2026-12-25T21:00:00.000Z');
    expect(weekend?.reopensAt.toISOString()).toBe('2026-12-28T00:00:00.000Z');
  });

  it('reports when the state next flips', () => {
    // open midweek -> next change is the coming Friday bell
    expect(getWeekendState(new Date('2026-09-02T13:00:00Z')).nextChangeAt.toISOString()).toBe(
      '2026-09-04T20:00:00.000Z'
    );
    // closed -> next change is the reopen
    expect(getWeekendState(new Date('2026-08-29T12:00:00Z')).nextChangeAt.toISOString()).toBe(
      '2026-08-31T00:00:00.000Z'
    );
  });
});

describe('getDayAgoState', () => {
  it('is always shut, referencing 24h back', () => {
    const { weekend } = getDayAgoState(new Date('2026-09-02T13:45:00Z'));
    expect(weekend?.closedAt.toISOString()).toBe('2026-09-01T13:00:00.000Z');
  });

  it('holds the reference instant still within the hour, so the price cache key is stable', () => {
    const at = (iso: string) => getDayAgoState(new Date(iso)).weekend?.closedAt.toISOString();
    expect(at('2026-09-02T13:00:00Z')).toBe(at('2026-09-02T13:59:59Z'));
    expect(at('2026-09-02T14:00:00Z')).toBe('2026-09-01T14:00:00.000Z');
  });

  it('re-checks on the hour', () => {
    expect(getDayAgoState(new Date('2026-09-02T13:45:00Z')).nextChangeAt.toISOString()).toBe(
      '2026-09-02T14:00:00.000Z'
    );
  });

  it('is shut on a midweek morning, when the real window is open', () => {
    const midweek = new Date('2026-09-02T13:45:00Z');
    expect(getDayAgoState(midweek).weekend).toBeDefined();
    expect(getWeekendState(midweek).weekend).toBeUndefined();
  });
});
