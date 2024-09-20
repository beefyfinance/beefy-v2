import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { initiateBoostForm } from '../../actions/boosts';
import { BIG_ZERO } from '../../../../helpers/big-number';
import type BigNumber from 'bignumber.js';
import type { BoostEntity } from '../../entities/boost';

// TODO: this looks exactly like the withdraw state
export type BoostState = {
  boostId: BoostEntity['id'] | undefined;
  max: boolean; // this is so we know when to disable the max button
  amount: BigNumber;
};

const initialBoostState: BoostState = {
  boostId: undefined,
  amount: BIG_ZERO,
  max: false,
};

export const boostSlice = createSlice({
  name: 'boost',
  initialState: initialBoostState,
  reducers: {
    reset() {
      return initialBoostState;
    },
    setMax(
      sliceState,
      action: PayloadAction<{
        balance: BigNumber;
      }>
    ) {
      const { balance } = action.payload;
      sliceState.amount = balance;
      sliceState.max = true;
    },
    setInput(sliceState, action: PayloadAction<{ amount: BigNumber; max: boolean }>) {
      const { amount, max } = action.payload;
      if (!sliceState.amount.isEqualTo(amount)) {
        sliceState.amount = amount;
      }
      if (sliceState.max !== max) {
        sliceState.max = max;
      }
    },
  },

  extraReducers: builder => {
    builder.addCase(initiateBoostForm.fulfilled, (sliceState, action) => {
      sliceState.boostId = action.payload.boostId;
      sliceState.amount = BIG_ZERO;
      sliceState.max = false;
    });
  },
});

export const boostActions = boostSlice.actions;
