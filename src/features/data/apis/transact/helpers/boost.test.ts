import { describe, expect, it } from 'vitest';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';
import { boostedCounterpart, boostIdForLeg } from './boost.ts';

describe('boostedCounterpart', () => {
  it('copies the option under a boost-suffixed id', () => {
    const option = { id: 'single-v1-USDC', strategyId: 'single', inputs: [] };

    expect(boostedCounterpart(option, 'moo_v1-boost')).toEqual({
      ...option,
      id: 'single-v1-usdc-boost-moo_v1-boost',
      boostId: 'moo_v1-boost',
    });
    expect(option).not.toHaveProperty('boostId');
  });
});

describe('boostIdForLeg', () => {
  it('stakes on the destination leg of a deposit and unstakes on the source leg of a withdraw', () => {
    const deposit = { mode: TransactMode.Deposit, boostId: 'moo_v1-boost' };
    const withdraw = { mode: TransactMode.Withdraw, boostId: 'moo_v1-boost' };

    expect(boostIdForLeg(deposit, 'dest')).toBe('moo_v1-boost');
    expect(boostIdForLeg(deposit, 'source')).toBeUndefined();
    expect(boostIdForLeg(withdraw, 'source')).toBe('moo_v1-boost');
    expect(boostIdForLeg(withdraw, 'dest')).toBeUndefined();
  });
});
