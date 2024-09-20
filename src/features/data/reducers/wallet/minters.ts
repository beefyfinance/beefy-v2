import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import type { MinterEntity } from '../../entities/minter';
import { formatTokenInput } from '../../../../helpers/format';
import { initiateMinterForm } from '../../actions/minters';

export type MinterState = {
  formData: {
    input: string;
    amount: BigNumber;
    max: boolean;
  };
  minterId: MinterEntity['id'] | undefined;
};

const initialMinterState: MinterState = {
  formData: {
    input: '',
    amount: BIG_ZERO,
    max: false,
  },
  minterId: undefined,
};

export const minterSlice = createSlice({
  name: 'minter',
  initialState: initialMinterState,
  reducers: {
    resetForm(sliceState) {
      sliceState.formData.amount = BIG_ZERO;
      sliceState.formData.max = false;
      sliceState.formData.input = '';
    },

    setMax(sliceState, action: PayloadAction<{ balance: BigNumber; decimals: number }>) {
      const { balance, decimals } = action.payload;
      const max = true;
      const value = new BigNumber(balance);

      sliceState.formData.input = formatTokenInput(balance, decimals);
      sliceState.formData.amount = value;
      sliceState.formData.max = max;
    },

    setInput(
      sliceState,
      action: PayloadAction<{ val: string; balance: BigNumber; decimals: number }>
    ) {
      const { val, balance, decimals } = action.payload;
      const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let max = false;
      let value = new BigNumber(input).decimalPlaces(decimals, BigNumber.ROUND_FLOOR);

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      if (value.isGreaterThanOrEqualTo(balance)) {
        value = new BigNumber(balance);
        max = true;
      }

      const formattedInput = (() => {
        if (value.isEqualTo(input)) return input;
        if (input === '') return '';
        if (input === '.') return `0.`;
        return formatTokenInput(value, decimals);
      })();

      sliceState.formData.input = formattedInput;
      sliceState.formData.amount = value;
      sliceState.formData.max = max;
    },
  },

  extraReducers: builder => {
    builder.addCase(initiateMinterForm.fulfilled, (sliceState, action) => {
      sliceState.minterId = action.payload.minterId;
    });
  },
});

export const minterActions = minterSlice.actions;
