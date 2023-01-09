import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { formatBigDecimals, formatBigNumberSignificant } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { initiateBoostForm } from '../../actions/boosts';
import { BoostEntity } from '../../entities/boost';
import { selectBoostUserBalanceInToken, selectUserBalanceOfToken } from '../../selectors/balance';
import { selectBoostById } from '../../selectors/boosts';
import { selectTokenByAddress } from '../../selectors/tokens';
import { selectVaultById } from '../../selectors/vaults';
import { BIG_ZERO } from '../../../../helpers/big-number';

// TODO: this looks exactly like the withdraw state
export type BoostState = {
  boostId: BoostEntity['id'];
  mode: 'stake' | 'unstake';
  max: boolean; // this is so we know when to disable the max button
  amount: BigNumber;
  formattedInput: string;
};
const initialBoostState: BoostState = {
  boostId: null,
  mode: 'stake',
  amount: BIG_ZERO,
  formattedInput: '',
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
        state: BeefyState;
      }>
    ) {
      const state = action.payload.state;
      const boost = selectBoostById(state, sliceState.boostId);
      const vault = selectVaultById(state, boost.vaultId);

      const balanceToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
      const balance =
        sliceState.mode === 'stake'
          ? selectUserBalanceOfToken(state, vault.chainId, vault.earnedTokenAddress) // mootoken
          : selectBoostUserBalanceInToken(state, boost.id); // staked
      sliceState.amount = balance;
      sliceState.formattedInput = formatBigDecimals(balance, balanceToken.decimals);
      sliceState.max = true;
    },
    setInput(
      sliceState,
      action: PayloadAction<{ amount: string; withdraw: boolean; state: BeefyState }>
    ) {
      const state = action.payload.state;

      const boost = selectBoostById(state, sliceState.boostId);
      const vault = selectVaultById(state, boost.vaultId);
      const balanceToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(balanceToken.decimals, BigNumber.ROUND_FLOOR);

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      const balance = action.payload.withdraw
        ? selectBoostUserBalanceInToken(state, boost.id)
        : selectUserBalanceOfToken(state, vault.chainId, balanceToken.address);

      if (value.isGreaterThanOrEqualTo(balance)) {
        value = new BigNumber(balance);
        sliceState.max = true;
      } else {
        sliceState.max = false;
      }

      const formattedInput = (() => {
        if (value.isEqualTo(input)) return input;
        if (input === '') return '';
        if (input === '.') return `0.`;
        return formatBigNumberSignificant(value);
      })();

      sliceState.formattedInput = formattedInput;
      sliceState.amount = value;
    },
  },

  extraReducers: builder => {
    builder.addCase(initiateBoostForm.fulfilled, (sliceState, action) => {
      sliceState.boostId = action.payload.boostId;
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.max = false;
      sliceState.mode = action.payload.mode;
    });
  },
});

export const boostActions = boostSlice.actions;
