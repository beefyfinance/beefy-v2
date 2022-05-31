import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { fetchBridgeChainData, initiateBridgeForm } from '../../actions/bridge';
import { BridgeInfoEntity } from '../../apis/bridge/bridge-types';
import { ChainEntity } from '../../entities/chain';
import { selectUserBalanceOfToken } from '../../selectors/balance';
import { selectBifiDestChainData } from '../../selectors/bridge';
import { selectChainById } from '../../selectors/chains';
import { selectTokenByAddress } from '../../selectors/tokens';

export type BridgeModalState = {
  fromChainId: ChainEntity['id'];
  destChainId: ChainEntity['id'];
  max: boolean;
  amount: BigNumber;
  formattedInput: string;
  formattedOutput: string;
  destChainInfo: BridgeInfoEntity | null;
  status: 'idle' | 'loading' | 'success';
};

const initialBridgeModalState: BridgeModalState = {
  fromChainId: 'bsc',
  destChainId: 'fantom',
  amount: BIG_ZERO,
  formattedInput: '',
  formattedOutput: '',
  max: false,
  destChainInfo: null,
  status: 'idle',
};

export const bridgeModalSlice = createSlice({
  name: 'bridge-modal',
  initialState: initialBridgeModalState,
  reducers: {
    resetForm() {
      return initialBridgeModalState;
    },

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

      const destChain = selectChainById(state, sliceState.destChainId);

      const destChainData = selectBifiDestChainData(state, destChain.networkChainId);

      const formattedOutput = (() => {
        if (balance && destChainData) {
          const minFee = destChainData.BaseFeePercent
            ? new BigNumber(
                (destChainData.MinimumSwapFee / (100 + destChainData.BaseFeePercent)) * 100
              )
            : new BigNumber(destChainData.MinimumSwapFee);

          const baseFee = destChainData.BaseFeePercent ? minFee : new BigNumber(BIG_ZERO);
          const fee = balance.times(destChainData.SwapFeeRatePerMillion);

          let outputValue = balance.minus(fee);
          if (fee.gt(minFee)) {
            outputValue = balance.minus(minFee);
          } else if (fee.gt(new BigNumber(destChainData.MaximumSwapFee))) {
            outputValue = balance.minus(new BigNumber(destChainData.MaximumSwapFee));
          } else {
            outputValue = balance.minus(fee).minus(baseFee);
          }
          if (outputValue && outputValue.isGreaterThan(BIG_ZERO)) {
            return outputValue.toFixed(4);
          }
          return new BigNumber(BIG_ZERO).toFixed(2);
        } else {
          return new BigNumber(BIG_ZERO).toFixed(2);
        }
      })();

      sliceState.amount = balance;
      sliceState.formattedInput = formatBigDecimals(balance, 4);
      sliceState.formattedOutput = formattedOutput;
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

      const destChain = selectChainById(state, sliceState.destChainId);

      const destChainData = selectBifiDestChainData(state, destChain.networkChainId);

      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(balanceToken.decimals);

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

      const formattedOutput = (() => {
        if (value && destChainData) {
          const minFee = destChainData.BaseFeePercent
            ? new BigNumber(
                (destChainData.MinimumSwapFee / (100 + destChainData.BaseFeePercent)) * 100
              )
            : new BigNumber(destChainData.MinimumSwapFee);

          const baseFee = destChainData.BaseFeePercent ? minFee : new BigNumber(BIG_ZERO);
          const fee = value.times(new BigNumber(destChainData.SwapFeeRatePerMillion));
          let outputValue = value.minus(fee);
          if (fee.gt(minFee)) {
            outputValue = value.minus(minFee);
          } else if (fee.gt(new BigNumber(destChainData.MaximumSwapFee))) {
            outputValue = value.minus(new BigNumber(destChainData.MaximumSwapFee));
          } else {
            outputValue = value.minus(fee).minus(baseFee);
          }
          if (value && outputValue.isGreaterThan(BIG_ZERO)) {
            return outputValue.toFixed(4);
          }
          return new BigNumber(BIG_ZERO).toFixed(2);
        } else {
          return new BigNumber(BIG_ZERO).toFixed(2);
        }
      })();

      sliceState.formattedInput = formattedInput;
      sliceState.formattedOutput = formattedOutput;
      sliceState.amount = value;
    },

    setFromChain(sliceState, action: PayloadAction<{ chainId: string }>) {
      const { chainId } = action.payload;

      if (chainId === sliceState.destChainId) {
        const oldFromChain = sliceState.fromChainId;
        console.log(oldFromChain);
        sliceState.fromChainId = chainId;
        sliceState.destChainId = oldFromChain;
      } else {
        sliceState.fromChainId = chainId;
      }
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
