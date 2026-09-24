import { describe, expect, it, vi } from 'vitest';
import {
  arcNative,
  arcUsdc,
  baseNative,
  baseUsdc,
  bn,
  makeState,
  metisNative,
} from '../apis/transact/helpers/same-balance.test-helper.ts';
import type { TokenEntity } from '../entities/token.ts';
import { selectTokenInputDecimals } from '../selectors/tokens.ts';
import { transactSetInputAmount, transactSetTokenInputAmount } from './transact.ts';

const state = makeState();

function dispatched(token: TokenEntity, amount: string, max = false) {
  const dispatch = vi.fn();
  transactSetTokenInputAmount({ index: 0, token, amount: bn(amount), max })(
    dispatch,
    () => state,
    undefined
  );
  expect(dispatch).toHaveBeenCalledTimes(1);
  const action = dispatch.mock.calls[0][0] as ReturnType<typeof transactSetInputAmount>;
  expect(action.type).toBe(transactSetInputAmount.type);
  return action.payload;
}

describe('selectTokenInputDecimals', () => {
  it('caps native at the erc20 view decimals where balanceSharedWithWrapped and dp differ', () => {
    expect(selectTokenInputDecimals(state, arcNative)).toBe(6);
    expect(selectTokenInputDecimals(state, arcUsdc)).toBe(6);
  });

  it('keeps each token decimals everywhere else', () => {
    expect(selectTokenInputDecimals(state, baseNative)).toBe(18);
    expect(selectTokenInputDecimals(state, baseUsdc)).toBe(6);
    // metis shares a balance too, but both views have 18 decimals
    expect(selectTokenInputDecimals(state, metisNative)).toBe(18);
  });
});

describe('transactSetTokenInputAmount', () => {
  it('floors a native amount to the erc20 view decimals where dp differ, keeping index and max', () => {
    const payload = dispatched(arcNative, '12.345678901234567891', true);
    expect(payload.amount.toString(10)).toBe('12.345678');
    expect(payload).toMatchObject({ index: 0, max: true });
  });

  it('never rounds up', () => {
    expect(dispatched(arcNative, '0.9999999').amount.toString(10)).toBe('0.999999');
  });

  it('leaves other tokens at their own precision', () => {
    expect(dispatched(baseNative, '1.000000000000000001').amount.toString(10)).toBe(
      '1.000000000000000001'
    );
    expect(dispatched(metisNative, '1.000000000000000001').amount.toString(10)).toBe(
      '1.000000000000000001'
    );
  });
});
