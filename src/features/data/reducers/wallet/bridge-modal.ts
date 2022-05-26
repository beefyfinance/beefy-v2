import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { fetchBridgeChainData, initiateBridgeForm } from '../../actions/bridge';
import { ChainEntity } from '../../entities/chain';
import { selectUserBalanceOfToken } from '../../selectors/balance';
import { selectTokenByAddress } from '../../selectors/tokens';

export type BridgeModalState = {
  fromChainId: ChainEntity['id'];
  destChainId: ChainEntity['id'];
  max: boolean;
  amount: BigNumber;
  formattedInput: string;
  destChainInfo: any;
  status: 'idle' | 'loading' | 'success';
};

const initialBridgeModalState: BridgeModalState = {
  fromChainId: 'bsc',
  destChainId: 'fantom',
  amount: BIG_ZERO,
  formattedInput: '',
  max: false,
  destChainInfo: {},
  status: 'idle',
};

export const bridgeModalSlice = createSlice({
  name: 'bridge-modal',
  initialState: initialBridgeModalState,
  reducers: {
    setMax(
      sliceState,
      action: PayloadAction<{
        chainId: string;
        tokenAddress: string;
        state: BeefyState;
      }>
    ) {
      const { state, chainId, tokenAddress } = action.payload;

      const balance = selectUserBalanceOfToken(state, chainId, tokenAddress);

      sliceState.amount = balance;
      sliceState.formattedInput = formatBigDecimals(balance, 4);
      sliceState.max = true;
    },

    setInput(
      sliceState,
      action: PayloadAction<{
        amount: string;
        chainId: string;
        tokenAddress: string;
        state: BeefyState;
      }>
    ) {
      const { state, chainId, tokenAddress } = action.payload;
      const balanceToken = selectTokenByAddress(state, chainId, tokenAddress);

      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(balanceToken.decimals, BigNumber.ROUND_DOWN);

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      const balance = selectUserBalanceOfToken(state, chainId, tokenAddress);

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
        return formatBigNumberSignificant(value, 3);
      })();

      sliceState.formattedInput = formattedInput;
      sliceState.amount = value;
    },

    setFromChain(sliceState, action: PayloadAction<{ chainId: string }>) {
      const { chainId } = action.payload;
      sliceState.fromChainId = chainId;
    },

    setDestChain(
      sliceState,
      action: PayloadAction<{
        destChainId: string;
      }>
    ) {
      const { destChainId } = action.payload;

      sliceState.destChainId = destChainId;
    },

    setStatus(sliceState, action: PayloadAction<{ status: 'idle' | 'loading' | 'success' }>) {
      const { status } = action.payload;

      sliceState.status = status;
    },
  },

  extraReducers: builder => {
    builder.addCase(initiateBridgeForm.fulfilled, (sliceState, action) => {
      sliceState.fromChainId = action.payload.chainId;
      sliceState.destChainId = action.payload.destChainId;
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.max = false;
      sliceState.destChainInfo = action.payload.destChainInfo;
    });
    builder.addCase(fetchBridgeChainData.fulfilled, (sliceState, action) => {
      sliceState.destChainInfo = action.payload.destChainInfo;
    });
  },
});

export const bridgeModalActions = bridgeModalSlice.actions;
