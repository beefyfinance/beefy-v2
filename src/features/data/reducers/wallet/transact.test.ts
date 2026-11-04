import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import {
  transactClearInput,
  transactSetInputAmount,
  transactSwitchMode,
} from '../../actions/transact.ts';
import { TransactMode } from './transact-types.ts';
import { transactReducer } from './transact.ts';

const entered = new BigNumber(1);
const shares = new BigNumber('0.914662032379035946');

function withEnteredAmount() {
  return transactReducer(
    undefined,
    transactSetInputAmount({ index: 0, amount: shares, max: false, enteredAmount: entered })
  );
}

describe('transact input entered amount', () => {
  it('keeps the entered amount alongside the stored amount', () => {
    const state = withEnteredAmount();
    expect(state.inputAmounts[0]).toEqual(shares);
    expect(state.inputEnteredAmounts[0]).toEqual(entered);
  });

  it('drops the entered amount when an amount is set without one', () => {
    const state = transactReducer(
      withEnteredAmount(),
      transactSetInputAmount({ index: 0, amount: new BigNumber(5), max: true })
    );
    expect(state.inputEnteredAmounts[0]).toBeUndefined();
  });

  it('drops the entered amount when the input is cleared or the mode switches', () => {
    expect(transactReducer(withEnteredAmount(), transactClearInput()).inputEnteredAmounts).toEqual(
      []
    );
    expect(
      transactReducer(withEnteredAmount(), transactSwitchMode(TransactMode.Withdraw))
        .inputEnteredAmounts
    ).toEqual([]);
  });
});
