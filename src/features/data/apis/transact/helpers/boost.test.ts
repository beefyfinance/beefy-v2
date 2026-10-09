import { describe, expect, it } from 'vitest';
import { insertBoostedCounterparts } from './boost.ts';

type Opt = { id: string; strategyId: string; boostId?: string };

const options: Opt[] = [
  { id: 'vault-v1-usdc', strategyId: 'vault' },
  { id: 'single-v1-usdc', strategyId: 'single' },
  { id: 'conic-v1-usdc', strategyId: 'conic' },
];

describe('insertBoostedCounterparts', () => {
  it('adds a boosted copy right after each boostable option only', () => {
    const result = insertBoostedCounterparts(
      options,
      'moo_v1-boost',
      o => o.strategyId === 'single'
    );

    expect(result.map(o => o.id)).toEqual([
      'vault-v1-usdc',
      'single-v1-usdc',
      'single-v1-usdc-boost-moo_v1-boost',
      'conic-v1-usdc',
    ]);
    expect(result[2]).toEqual({ ...options[1], id: result[2].id, boostId: 'moo_v1-boost' });
    expect(result[1].boostId).toBeUndefined();
  });
});
