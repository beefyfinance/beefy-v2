import { describe, expect, it } from 'vitest';
import { cooperativeAllSettled } from './async-utils.ts';

const mapper = async (n: number) => {
  if (n % 7 === 3) {
    throw new Error(`boom ${n}`);
  }
  return n * 2;
};

describe('cooperativeAllSettled', () => {
  it('matches Promise.allSettled, in input order', async () => {
    const inputs = Array.from({ length: 120 }, (_, i) => i);
    const expected = await Promise.allSettled(inputs.map(mapper));
    const actual = await cooperativeAllSettled(inputs, mapper, { budgetMs: 0 });
    expect(actual).toEqual(expected);
  });

  it('returns exactly one result per input', async () => {
    // regression: pre-sizing the results array and also pushing to it produced a
    // double-length array whose first half was undefined
    const inputs = Array.from({ length: 40 }, (_, i) => i);
    const actual = await cooperativeAllSettled(inputs, mapper, { budgetMs: 0 });
    expect(actual).toHaveLength(inputs.length);
    expect(actual.every(r => r !== undefined)).toBe(true);
    expect(actual[0]).toEqual({ status: 'fulfilled', value: 0 });
  });

  it('keeps results aligned to their input index when items settle out of order', async () => {
    const inputs = [30, 10, 20, 0];
    const actual = await cooperativeAllSettled(
      inputs,
      // later inputs resolve first
      async n => {
        await new Promise(resolve => setTimeout(resolve, n));
        return n;
      },
      { budgetMs: 0 }
    );
    expect(actual.map(r => (r.status === 'fulfilled' ? r.value : null))).toEqual(inputs);
  });

  it('captures rejections rather than throwing', async () => {
    const actual = await cooperativeAllSettled([3], mapper, { budgetMs: 0 });
    expect(actual[0].status).toBe('rejected');
    expect((actual[0] as PromiseRejectedResult).reason).toBeInstanceOf(Error);
  });

  it('handles an empty input list', async () => {
    await expect(cooperativeAllSettled([], mapper)).resolves.toEqual([]);
  });

  it('accepts a synchronous mapper', async () => {
    const actual = await cooperativeAllSettled([1, 2, 3], n => n * 10, { budgetMs: 0 });
    expect(actual).toEqual([
      { status: 'fulfilled', value: 10 },
      { status: 'fulfilled', value: 20 },
      { status: 'fulfilled', value: 30 },
    ]);
  });

  it('never exceeds maxPending concurrent mappers', async () => {
    let inFlight = 0;
    let peak = 0;
    const inputs = Array.from({ length: 60 }, (_, i) => i);
    await cooperativeAllSettled(
      inputs,
      async () => {
        peak = Math.max(peak, ++inFlight);
        await new Promise(resolve => setTimeout(resolve, 1));
        --inFlight;
      },
      { maxPending: 5, budgetMs: 0 }
    );
    expect(peak).toBeLessThanOrEqual(5);
  });

  it('still returns correct results with the concurrency cap disabled', async () => {
    const inputs = Array.from({ length: 20 }, (_, i) => i);
    const expected = await Promise.allSettled(inputs.map(mapper));
    await expect(cooperativeAllSettled(inputs, mapper, { maxPending: 0 })).resolves.toEqual(
      expected
    );
  });

  it('actually yields between items when the budget is exceeded', async () => {
    // a macrotask scheduled before the loop must get to run before the loop finishes
    const inputs = Array.from({ length: 50 }, (_, i) => i);
    let interleaved = false;
    let done = false;
    setTimeout(() => {
      if (!done) interleaved = true;
    }, 0);

    await cooperativeAllSettled(
      inputs,
      () => {
        const start = performance.now();
        while (performance.now() - start < 2) {
          /* burn 2ms so the budget is exceeded */
        }
        return 1;
      },
      { budgetMs: 1 }
    );
    done = true;
    expect(interleaved).toBe(true);
  });
});
