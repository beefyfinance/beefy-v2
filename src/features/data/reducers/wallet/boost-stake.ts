import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { BoostEntity } from '../../entities/boost';
import { selectBoostUserBalanceInToken, selectWalletBalanceOfToken } from '../../selectors/balance';
import { selectBoostById } from '../../selectors/boosts';
import { selectTokenById } from '../../selectors/tokens';
import { selectVaultById } from '../../selectors/vaults';

// TODO: this looks exactly like the withdraw state
export type BoostModalState = {
  boostId: BoostEntity['id'];
  max: boolean; // this is so we know when to disable the max button
  amount: BigNumber;
  formattedInput: string;
};
const initialBoostModalState: BoostModalState = {
  boostId: null,
  amount: BIG_ZERO,
  formattedInput: '',
  max: false,
};

export const boostModalSlice = createSlice({
  name: 'boost-modal',
  initialState: initialBoostModalState,
  reducers: {
    setBoost(sliceState, action: PayloadAction<{ boostId: BoostEntity['id'] }>) {
      sliceState.boostId = action.payload.boostId;
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.max = false;
    },

    setMax(
      sliceState,
      action: PayloadAction<{
        mode: 'stake' | 'unstake';
        state: BeefyState;
      }>
    ) {
      const state = action.payload.state;
      const boost = selectBoostById(state, sliceState.boostId);
      const vault = selectVaultById(state, boost.vaultId);

      const balanceToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
      const balance =
        action.payload.mode === 'stake'
          ? selectWalletBalanceOfToken(state, vault.chainId, vault.earnedTokenId) // mootoken
          : selectBoostUserBalanceInToken(state, boost.id); // staked
      sliceState.amount = balance;
      sliceState.formattedInput = formatBigDecimals(balance, balanceToken.decimals);
      sliceState.max = true;
    },

    setInput(sliceState, action: PayloadAction<{ amount: string; state: BeefyState }>) {
      const state = action.payload.state;

      const boost = selectBoostById(state, sliceState.boostId);
      const vault = selectVaultById(state, boost.vaultId);
      const balanceToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);

      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(balanceToken.decimals, BigNumber.ROUND_DOWN);

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      const balance = selectWalletBalanceOfToken(state, vault.chainId, balanceToken.id);
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
});

export const boostModalActions = boostModalSlice.actions;
