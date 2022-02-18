import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/format';
import { initiateDepositForm } from '../actions/deposit';
import { TokenErc20 } from '../entities/token';
/**
 * State containing Vault infos
 */
export type DepositState = {
  initiated: boolean;
  routes: TokenErc20['id'][];
  selectedToken: TokenErc20['id'];
  depositAmount: BigNumber;
};
export const initialDepositState: DepositState = {
  initiated: false,
  routes: [],
  depositAmount: BIG_ZERO,
  selectedToken: null,
};

export const depositSlice = createSlice({
  name: 'deposit',
  initialState: initialDepositState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(initiateDepositForm.fulfilled, (sliceState, action) => {
      // TODO
    });
  },
});

export const depositActions = depositSlice.actions;
